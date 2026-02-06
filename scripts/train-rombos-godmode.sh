#!/bin/bash
#
# ASX ULTRA QLoRA++ - ROMBOS CODER GODMODE TRAINING
#
# Quick start script for training Rombos Coder Qwen 7B
# with ASX GODMODE datasets
#

set -e

echo "🔥 ASX ULTRA QLoRA++ - ROMBOS CODER GODMODE"
echo "============================================"
echo ""

# Configuration
PRESET="rombos_coder_qwen7b"
OUTPUT_DIR="python/local_out_rombos_ultra_qlora"
MAX_STEPS=1200
DEVICE="auto"

# Datasets (based on curriculum)
DATASETS=(
  "dataset/xjson/train_xjson_seed.jsonl"
  "dataset/xjson/train_xjson_auto.jsonl"
  "dataset/kuhul/train_kuhul_auto.jsonl"
  "dataset/scxq2/scxq2_pairs.jsonl"
  "dataset/xcfe/xcfe_decisions.jsonl"
  "dataset/hive/hive_routes.jsonl"
)

# Check if datasets exist
echo "📊 Checking datasets..."
for dataset in "${DATASETS[@]}"; do
  if [ -f "$dataset" ]; then
    echo "  ✓ $dataset"
  else
    echo "  ✗ $dataset (missing - will be skipped)"
  fi
done
echo ""

# Check if output directory exists
if [ -d "$OUTPUT_DIR" ]; then
  echo "⚠️  Output directory exists: $OUTPUT_DIR"
  read -p "Continue training (will resume if possible)? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
fi

echo ""
echo "🚀 Starting training..."
echo "  Model: $PRESET"
echo "  Output: $OUTPUT_DIR"
echo "  Max steps: $MAX_STEPS"
echo "  Device: $DEVICE"
echo ""

# Run training
python -m python.local.asx_ultra_trainer_qlora \
  --preset "$PRESET" \
  --data "${DATASETS[@]}" \
  --out "$OUTPUT_DIR" \
  --device "$DEVICE" \
  --max-steps "$MAX_STEPS" \
  --lora-r 64 \
  --lora-alpha 32 \
  --lora-dropout 0.05 \
  --eval-ratio 0.05 \
  --batch-size 1 \
  --grad-accum 8 \
  --lr 2e-4

echo ""
echo "✅ Training complete!"
echo ""
echo "📁 Output directory: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "  1. Merge LoRA adapter:"
echo "     python scripts/merge-lora.py --base rombos/rombos-coder-v2.5-qwen-7b --lora $OUTPUT_DIR --out $OUTPUT_DIR/merged"
echo ""
echo "  2. Export to GGUF:"
echo "     python llama.cpp/convert-hf-to-gguf.py $OUTPUT_DIR/merged --outfile $OUTPUT_DIR/rombos-coder-v2.5-qwen-7b-GODMODE.gguf --outtype q4_k_m"
echo ""
echo "  3. Load into Ollama:"
echo "     ollama create rombos-coder-godmode -f Modelfile"
echo ""
