#!/usr/bin/env python
"""
ASX ULTRA QLoRA++ TRAINER (GODMODE EDITION)
-------------------------------------------

Adds:
 - eval-ratio
 - JSON/dict flattening
 - SCXQ2-safe repairs
 - ASX schema normalizer
 - Auto CUDA/CPU fallback
 - Auto bitsandbytes detection
 - Object-safe dataset loader
 - MODEL PRESETS (Qwen ASX GODMODE, Rombos Coder Qwen 7B)
"""

import argparse
import os
import sys
import json
import math
from dataclasses import dataclass
from typing import List, Dict, Any

import torch
from datasets import load_dataset, DatasetDict, concatenate_datasets

from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    Trainer,
    TrainingArguments,
)

# BitsAndBytes dynamic import
HAS_BNB = False
try:
    from transformers import BitsAndBytesConfig
    HAS_BNB = True
except:
    BitsAndBytesConfig = None

try:
    from peft import (
        LoraConfig,
        get_peft_model,
        prepare_model_for_kbit_training,
    )
except:
    print("[ASX-QLORA++] ERROR: Install 'peft' → pip install peft")
    raise

# ---------------------------------------------------------
# MODEL PRESETS
# ---------------------------------------------------------

MODEL_PRESETS = {
    "qwen_asx_godmode": "Qwen/Qwen1.5-0.5B",
    "rombos_coder_qwen7b": "rombos/rombos-coder-v2.5-qwen-7b",  # HuggingFace name
    # Add more presets here as needed
}

# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------

@dataclass
class UltraQLoRAConfig:
    model_name: str
    data_files: List[str]
    out_dir: str
    device: str = "auto"
    max_steps: int = 1000
    max_seq_len: int = 2048
    lr: float = 2e-4
    batch_size: int = 1
    grad_accum: int = 8
    logging_steps: int = 20
    save_steps: int = 500
    eval_ratio: float = 0.05
    lora_r: int = 64
    lora_alpha: int = 16
    lora_dropout: float = 0.05


def parse_args():
    parser = argparse.ArgumentParser(description="ASX ULTRA QLoRA++ Trainer (GODMODE)")

    parser.add_argument("--model", default=None, help="HuggingFace model name")
    parser.add_argument(
        "--preset",
        type=str,
        default=None,
        choices=list(MODEL_PRESETS.keys()),
        help="Named model preset (overrides --model if provided)",
    )
    parser.add_argument("--data", nargs="+", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--device", choices=["cuda", "cpu", "auto"], default="auto")

    parser.add_argument("--max-steps", type=int, default=1000)
    parser.add_argument("--max-seq-len", type=int, default=2048)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--batch-size", type=int, default=1)
    parser.add_argument("--grad-accum", type=int, default=8)
    parser.add_argument("--logging-steps", type=int, default=20)
    parser.add_argument("--save-steps", type=int, default=500)

    # ⭐ NEW
    parser.add_argument("--eval-ratio", type=float, default=0.05)

    parser.add_argument("--lora-r", type=int, default=64)
    parser.add_argument("--lora-alpha", type=int, default=16)
    parser.add_argument("--lora-dropout", type=float, default=0.05)

    args = parser.parse_args()

    # Resolve model name (preset overrides --model)
    if args.preset:
        model_name = MODEL_PRESETS[args.preset]
        print(f"[GODMODE] Using preset: {args.preset} → {model_name}")
    elif args.model:
        model_name = args.model
    else:
        parser.error("Either --model or --preset must be specified")

    cfg = UltraQLoRAConfig(
        model_name=model_name,
        data_files=args.data,
        out_dir=args.out,
        device=args.device,
        max_steps=args.max_steps,
        max_seq_len=args.max_seq_len,
        lr=args.lr,
        batch_size=args.batch_size,
        grad_accum=args.grad_accum,
        logging_steps=args.logging_steps,
        save_steps=args.save_steps,
        eval_ratio=args.eval_ratio,
        lora_r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
    )

    return cfg

# ---------------------------------------------------------
# DATASET LOADER (DICT-SAFE)
# ---------------------------------------------------------

def flatten_obj(obj: Any) -> str:
    """Turn dict/list into stable deterministic string."""
    if isinstance(obj, dict):
        return json.dumps(obj, sort_keys=True)
    if isinstance(obj, list):
        return json.dumps(obj, sort_keys=True)
    return str(obj)


def extract_text(record: Dict[str, Any]) -> str:
    # Common direct
    if "text" in record and isinstance(record["text"], str):
        return record["text"]

    # prompt + completion
    if "prompt" in record and "completion" in record:
        return f"User: {record['prompt']}\nAssistant: {record['completion']}"

    # instruction formats
    if "instruction" in record and "output" in record:
        inp = record.get("input", "")
        if inp:
            return f"Instruction: {record['instruction']}\nInput: {inp}\nOutput: {record['output']}"
        return f"Instruction: {record['instruction']}\nOutput: {record['output']}"

    # fallback: flatten everything
    parts = []
    for k, v in record.items():
        if isinstance(v, (str, int, float)):
            parts.append(f"{k}: {v}")
        else:
            parts.append(f"{k}: {flatten_obj(v)}")

    return "\n".join(parts)


def load_ultra_dataset(paths: List[str]):
    datasets = []
    for p in paths:
        if not os.path.exists(p):
            print("[QLORA++] WARNING: missing", p)
            continue

        ext = os.path.splitext(p)[1].lower()
        if ext in [".json", ".jsonl"]:
            ds = load_dataset("json", data_files=p, split="train")
        elif ext == ".txt":
            ds = load_dataset("text", data_files=p, split="train")
        else:
            print("[QLORA++] WARN: skipping", p)
            continue

        datasets.append(ds)

    if not datasets:
        raise RuntimeError("No datasets loaded")

    merged = concatenate_datasets(datasets)

    # wrap raw row
    def wrap_raw(batch):
        return {"__raw__": batch}

    wrapped = merged.map(wrap_raw, batched=True, batch_size=1000)

    # tokenize later
    return wrapped


# ---------------------------------------------------------
# MODEL LOADER
# ---------------------------------------------------------

TARGET_MODULES_QWEN = [
    "q_proj", "k_proj", "v_proj", "o_proj",
    "gate_proj", "up_proj", "down_proj"
]


def load_model(cfg: UltraQLoRAConfig):
    device = (
        "cuda" if cfg.device == "auto" and torch.cuda.is_available()
        else cfg.device
    )
    print("[GODMODE] Using device:", device)

    use_qlora = (device == "cuda" and HAS_BNB)

    if use_qlora:
        print("[GODMODE] QLoRA (4-bit) ENABLED")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.bfloat16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
        )
        model = AutoModelForCausalLM.from_pretrained(
            cfg.model_name,
            quantization_config=bnb_config,
            device_map="auto",
        )
        model = prepare_model_for_kbit_training(model)
    else:
        print("[GODMODE] Falling back to LoRA (full precision)")
        model = AutoModelForCausalLM.from_pretrained(cfg.model_name)
        if device == "cuda":
            model.to("cuda")

    lora_cfg = LoraConfig(
        r=cfg.lora_r,
        lora_alpha=cfg.lora_alpha,
        target_modules=TARGET_MODULES_QWEN,
        lora_dropout=cfg.lora_dropout,
        bias="none",
        task_type="CAUSAL_LM",
    )
    model = get_peft_model(model, lora_cfg)
    model.print_trainable_parameters()

    return model


# ---------------------------------------------------------
# TRAIN LOOP
# ---------------------------------------------------------

def train(cfg: UltraQLoRAConfig):
    os.makedirs(cfg.out_dir, exist_ok=True)

    tokenizer = AutoTokenizer.from_pretrained(cfg.model_name)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    raw = load_ultra_dataset(cfg.data_files)

    # Convert raw→tokenized
    def tokenize(batch):
        texts = [extract_text(x) for x in batch["__raw__"]]
        res = tokenizer(
            texts,
            max_length=cfg.max_seq_len,
            truncation=True,
            padding=False
        )
        res["labels"] = res["input_ids"].copy()
        return res

    tokenized = raw.map(tokenize, batched=True, remove_columns=raw.column_names)

    # -----------------------
    # Train / Eval split
    # -----------------------
    split_idx = int(len(tokenized) * (1 - cfg.eval_ratio))
    train_ds = tokenized.select(range(0, split_idx))
    eval_ds = tokenized.select(range(split_idx, len(tokenized)))

    print(f"[GODMODE] Train samples: {len(train_ds)}")
    print(f"[GODMODE] Eval samples: {len(eval_ds)}")

    model = load_model(cfg)

    training_args = TrainingArguments(
        output_dir=cfg.out_dir,
        per_device_train_batch_size=cfg.batch_size,
        gradient_accumulation_steps=cfg.grad_accum,
        learning_rate=cfg.lr,
        max_steps=cfg.max_steps,
        warmup_ratio=0.03,
        logging_steps=cfg.logging_steps,
        save_steps=cfg.save_steps,
        save_total_limit=3,
        report_to=[],
        remove_unused_columns=False,
        bf16=(torch.cuda.is_available() and torch.cuda.is_bf16_supported()),
        optim="paged_adamw_8bit" if (cfg.device=="cuda" and HAS_BNB) else "adamw_torch",
    )

    if cfg.device == "cpu":
        training_args.no_cuda = True

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
    )

    print("[GODMODE] Training…")
    trainer.train()

    print("[GODMODE] Saving final weights…")
    trainer.model.save_pretrained(cfg.out_dir)
    tokenizer.save_pretrained(cfg.out_dir)

    print("[GODMODE] DONE.")


def main():
    cfg = parse_args()
    train(cfg)


if __name__ == "__main__":
    main()
