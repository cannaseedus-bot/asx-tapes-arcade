# 🌐 K'UHUL - Fractal OS Scheduler

**Intelligent workload routing for ASX Tapes Arcade**

K'UHUL is the central scheduler that routes LLM inference tasks to the best available device (CPU, iGPU, dGPU, or WebGPU) based on current system load, model requirements, and task priority.

---

## 🎯 Overview

### What is K'UHUL?

K'UHUL stands for **K'uhul Universal Hierarchical Unified Load-balancer**. It's inspired by the K'uhul Ajaw (divine lords) of Maya civilization - powerful orchestrators that coordinate multiple entities.

In ASX, K'UHUL coordinates:
- **Multiple AI models** (Cline, Rombos, Janus, Micronauts)
- **Multiple compute devices** (CPU cores, integrated GPU, dedicated GPU, WebGPU)
- **Multiple execution backends** (Ollama, llama.cpp, WebLLM)

---

## 📁 File Structure

```
/kuhul/
  FRACTAL-OS.json       ← Device profiles and scheduler config
  scheduler.js          ← Core scheduler logic
  webgpu-adapter.js     ← WebGPU/WebLLM integration
  README.md             ← This file
  logs/                 ← Scheduler logs
```

---

## 🚀 Quick Start

### 1. Initialize K'UHUL

```javascript
// In your app
const scheduler = new KuhulScheduler();
await scheduler.init();

console.log('K\'UHUL initialized with profile:', scheduler.deviceProfile.id);
```

### 2. Schedule an Inference Job

```javascript
// Simple usage
const result = await kuhulRombosCall(
  "Review this code: function add(a, b) { return a + b; }",
  {
    type: 'code_review',
    model: 'Q4_K_M',  // or 'Q8_0' for higher quality
    temperature: 0.2
  }
);

console.log(result.result);
console.log('Executed on:', result.device);
console.log('Latency:', result.latency_ms, 'ms');
```

---

## ⚙️ Device Profiles

K'UHUL supports 3 device profiles defined in `FRACTAL-OS.json`:

### 1. Low-End Laptop
- **CPU:** 8 cores @ 2.4GHz
- **GPU:** Integrated (512MB VRAM)
- **RAM:** 16GB
- **Suitable for:** Q4 models on CPU, WebGPU fallback

### 2. Mid-Range Desktop
- **CPU:** 12 cores @ 3.6GHz
- **GPU:** Dedicated (e.g., RTX 3060, 12GB VRAM)
- **RAM:** 16GB
- **Suitable for:** Q4/Q8 models on GPU

### 3. High-End Workstation
- **CPU:** 16 cores @ 3.8GHz
- **GPU:** High-end (e.g., RTX 4090, 24GB VRAM)
- **RAM:** 32GB+
- **Suitable for:** All models, parallel tribunal

---

## 🧠 Routing Logic

### CPU-First Strategy (Default)

```
IF cpu_load < 75% AND model_engine == 'llama.cpp':
  → Route to CPU (good for GGUF models)

ELSE IF dgpu_available AND task_priority > 0.9:
  → Route to dGPU (high priority)

ELSE IF webgpu_available AND igpu_load < 80%:
  → Route to WebGPU (browser-based)

ELSE:
  → Queue and retry
```

### Tribunal Strategy (Parallel Judges)

```
IF all_judges_lightweight (Cline + Janus + Micronauts):
  → Run all 3 on CPU cores in parallel

ELSE IF has_heavy_model (Qwen Q8, MX2LM):
  → Split: CPU + GPU
```

---

## 📊 Model Shards

K'UHUL manages these LLM shards:

| Shard ID | Model | Size | Backend | Device |
|----------|-------|------|---------|--------|
| `llm_rombos_coder_qwen7b` | Rombos Q4_K_M | ~4GB | Ollama/llama.cpp | CPU/GPU |
| `llm_rombos_coder_qwen7b_q8` | Rombos Q8_0 | ~7GB | Ollama/llama.cpp | GPU preferred |
| `llm_janus` | Janus 7B | ~2GB | Ollama | CPU |
| `llm_micronauts` | Micronauts 1B | ~1GB | Ollama | CPU |
| `webgpu_rombos_coder_qwen7b` | Rombos WebGPU | ~4GB | WebLLM | iGPU/dGPU |

---

## 🔧 Configuration

### Edit Device Profile

Modify `FRACTAL-OS.json`:

```json
{
  "device_profiles": {
    "low_end_laptop": {
      "cpu": {
        "cores": 8,
        "score": 1.0
      },
      "memory_mb": 16000
    }
  }
}
```

### Adjust Scheduling Policy

```json
{
  "scheduler": {
    "policies": {
      "llm_infer": {
        "cpu_threshold_load": 0.75,  ← Change this
        "selection": "min-estimated-latency"
      }
    }
  }
}
```

---

## 🌐 WebGPU Integration

### Setup

```javascript
// Initialize WebGPU adapter
await window.ROMBOS_WEBGPU.init();
await window.ROMBOS_WEBGPU.loadModel('/models/rombos-webgpu/model.json');

// K'UHUL will automatically route to WebGPU when:
// - CPU is busy (load > 75%)
// - WebGPU is available
// - iGPU load < 80%
```

### WebGPU Model Export (Future)

To export Rombos to WebGPU/WebLLM format:

```bash
# 1. Convert HF model to MLC format
python -m mlc_llm.build --model rombos/rombos-coder-v2.5-qwen-7b \
  --quantization q4f16_1 \
  --target webgpu \
  --output models/rombos-webgpu

# 2. Host weights as static files
cp -r models/rombos-webgpu /path/to/asx-tapes-arcade/public/models/

# 3. Update FRACTAL-OS.json with manifest URL
```

---

## 📈 Monitoring

### Get Scheduler Metrics

```javascript
const metrics = window.KUHUL_SCHEDULER.getMetrics();

console.log(metrics);
// {
//   total_jobs: 127,
//   successful_jobs: 125,
//   failed_jobs: 2,
//   avg_latency_ms: 1845,
//   device_profile: 'low-end-laptop',
//   success_rate: '98.4%',
//   system_state: { cpu: {...}, gpu: {...} }
// }
```

### Monitor System State

```javascript
const state = window.KUHUL_SCHEDULER.systemState;

console.log('CPU Load:', (state.cpu.load * 100).toFixed(1), '%');
console.log('GPU Load:', (state.gpu.load * 100).toFixed(1), '%');
console.log('Memory:', state.memory.used_mb, '/', state.memory.total_mb, 'MB');
```

---

## 🎯 Use Cases

### 1. Multi-Judge Tribunal

```javascript
// K'UHUL automatically distributes judges across devices
const tribunal = new Tribunal();
const session = await tribunal.evaluate({
  type: 'code_review',
  content: myCode
});

// Behind the scenes, K'UHUL routes:
// - Cline → CPU core 1-4
// - Janus → CPU core 5-8
// - Micronauts → CPU core 9-12
// (All run in parallel!)
```

### 2. Dynamic Model Selection

```javascript
// K'UHUL picks best model variant based on current load
const result = await kuhulRombosCall(prompt, {
  model: 'auto',  // K'UHUL decides Q4 vs Q8
  priority: 0.95
});
```

### 3. GPU Offloading

```javascript
// Heavy task - K'UHUL routes to GPU
const result = await kuhulRombosCall(largePrompt, {
  type: 'security_audit',
  model: 'Q8_0',
  priority: 1.0  // High priority → use dGPU if available
});
```

---

## 🧪 Testing

### Test CPU Routing

```javascript
// Force high CPU load simulation
window.KUHUL_SCHEDULER.systemState.cpu.load = 0.9;

const result = await kuhulRombosCall("test", {});
console.log('Device:', result.device);  // Should route to WebGPU or queue
```

### Test Fallback

```javascript
// Disable primary model
delete window.KUHUL_SCHEDULER.config.shards.llm_rombos_coder_qwen7b;

const result = await kuhulRombosCall("test", {});
// Should fall back to llm_janus
```

---

## 🔍 Troubleshooting

### Q: K'UHUL always routes to CPU, never GPU

**A:** Check GPU configuration:

```javascript
console.log(scheduler.deviceProfile.gpu);

// If gpu.type === 'integrated' and low priority task,
// K'UHUL prefers CPU for GGUF models
//
// Solution: Increase task priority
kuhulRombosCall(prompt, { priority: 0.95 });
```

### Q: WebGPU adapter fails to initialize

**A:** WebGPU requires:
- Chrome/Edge 113+
- Enabled GPU acceleration
- Not in incognito mode (some browsers disable GPU)

Check:
```javascript
console.log('WebGPU supported?', 'gpu' in navigator);
```

### Q: High latency on low-end laptop

**A:** Use lightweight models:

```json
{
  "scheduler": {
    "routes": {
      "rombos_coder_qwen7b": {
        "fallback": "llm_janus"  ← Faster fallback
      }
    }
  }
}
```

---

## 📚 API Reference

### KuhulScheduler

#### `constructor()`
Create new scheduler instance.

#### `async init()`
Initialize with FRACTAL-OS config and detect device profile.

#### `async scheduleRombosJob(job, priority)`
Schedule inference job with priority.

**Parameters:**
- `job.type` - 'inference', 'code_review', etc.
- `job.prompt` - Input prompt
- `job.model` - 'Q4_K_M' or 'Q8_0'
- `priority` - 0.0-1.0 (default: 0.9)

**Returns:** `{ ok, result, device, latency_ms }`

#### `getMetrics()`
Get scheduler statistics.

---

### kuhulRombosCall(prompt, context)

High-level inference function.

```javascript
const result = await kuhulRombosCall(
  "Your prompt here",
  {
    type: 'code_review',
    model: 'Q4_K_M',
    temperature: 0.2,
    priority: 0.9
  }
);
```

---

## 🌟 Future Enhancements

- **Multi-GPU support** - Distribute across multiple GPUs
- **Network sharding** - Distribute to remote K'UHUL nodes
- **Auto-scaling** - Spin up/down model instances based on load
- **Cost optimization** - Route based on energy/cost
- **Quality-aware routing** - Pick model based on task difficulty

---

**Built with ⟁ by ASX Labs**

*Inspired by K'uhul Ajaw - Divine Lord Orchestrators*
