/**
 * K'UHUL FRACTAL-OS SCHEDULER
 *
 * Intelligent workload routing for ASX Tapes Arcade
 * Routes inference tasks to CPU, iGPU, dGPU, or WebGPU based on:
 * - Current system load
 * - Model requirements
 * - Task priority
 * - Device capabilities
 *
 * @author ASX Labs
 * @version 1.0.0
 */

class KuhulScheduler {
  constructor() {
    this.config = null;
    this.systemState = {
      cpu: { load: 0, cores: 0 },
      gpu: { load: 0, vram_used_mb: 0, vram_total_mb: 0 },
      memory: { used_mb: 0, total_mb: 0 },
      queue: []
    };
    this.metrics = {
      total_jobs: 0,
      successful_jobs: 0,
      failed_jobs: 0,
      avg_latency_ms: 0
    };
  }

  /**
   * Initialize scheduler with FRACTAL-OS config
   */
  async init() {
    const response = await fetch('/kuhul/FRACTAL-OS.json');
    this.config = await response.json();

    // Detect current device profile
    this.deviceProfile = await this.detectDeviceProfile();

    console.log(`[K'UHUL] Initialized with profile: ${this.deviceProfile.id}`);
    console.log(`[K'UHUL] Available shards:`, Object.keys(this.config.shards));

    // Start monitoring
    if (this.config.scheduler.monitoring.enabled) {
      this.startMonitoring();
    }

    return this;
  }

  /**
   * Detect device capabilities
   */
  async detectDeviceProfile() {
    const profiles = this.config.device_profiles;

    // Simple heuristic: use navigator.hardwareConcurrency and memory
    const cores = navigator.hardwareConcurrency || 4;
    const memory_gb = navigator.deviceMemory || 8;

    // Check for WebGPU support
    const hasWebGPU = 'gpu' in navigator;

    // Rough classification
    if (memory_gb >= 32 && cores >= 16) {
      return profiles.high_end_workstation;
    } else if (memory_gb >= 16 && cores >= 8) {
      return profiles.mid_range_desktop;
    } else {
      return profiles.low_end_laptop;
    }
  }

  /**
   * Schedule a Rombos job
   */
  async scheduleRombosJob(job, priority = 0.9) {
    const startTime = Date.now();

    console.log(`[K'UHUL] Scheduling job: ${job.type}`);

    // Get system state snapshot
    await this.updateSystemState();

    // Select shard based on model variant
    const shardId = job.model === 'Q8_0'
      ? 'llm_rombos_coder_qwen7b_q8'
      : 'llm_rombos_coder_qwen7b';

    const shard = this.config.shards[shardId];
    const route = this.config.scheduler.routes[shardId.replace('llm_', '')];
    const policy = this.config.scheduler.policies[route.policy];

    // Execute routing decision
    const decision = this.makeRoutingDecision(shard, policy, job, priority);

    console.log(`[K'UHUL] Decision:`, decision);

    // Execute job
    try {
      const result = await this.executeJob(decision, job);
      const latency = Date.now() - startTime;

      // Update metrics
      this.metrics.total_jobs++;
      this.metrics.successful_jobs++;
      this.updateAvgLatency(latency);

      return {
        ok: true,
        result: result,
        device: decision.device,
        latency_ms: latency
      };
    } catch (error) {
      this.metrics.total_jobs++;
      this.metrics.failed_jobs++;

      console.error(`[K'UHUL] Job failed:`, error);

      // Try fallback if available
      if (route.fallback) {
        console.log(`[K'UHUL] Trying fallback: ${route.fallback}`);
        const fallbackShard = this.config.shards[`llm_${route.fallback}`];
        const fallbackDecision = this.makeRoutingDecision(fallbackShard, policy, job, priority * 0.8);
        return await this.executeJob(fallbackDecision, job);
      }

      throw error;
    }
  }

  /**
   * Make routing decision (CPU vs iGPU vs dGPU vs WebGPU)
   */
  makeRoutingDecision(shard, policy, job, priority) {
    const cpuLoad = this.systemState.cpu.load;
    const gpuLoad = this.systemState.gpu.load;

    // Rule 1: CPU available and suitable for GGUF
    if (cpuLoad < policy.cpu_threshold_load && shard.engine === 'llama.cpp') {
      return {
        device: 'cpu-main',
        engine: 'llama.cpp',
        backend: shard.backend,
        endpoint: shard.endpoint,
        args: {
          threads: Math.max(4, this.deviceProfile.cpu.cores - 2),
          model: shard.model_file
        }
      };
    }

    // Rule 2: dGPU available for high priority
    if (this.deviceProfile.gpu?.type === 'dedicated' && priority > 0.9) {
      return {
        device: 'dgpu-0',
        engine: 'llama.cpp-cuda',
        backend: shard.backend,
        endpoint: shard.endpoint,
        args: {
          gpu_layers: 99,
          model: shard.model_file
        }
      };
    }

    // Rule 3: WebGPU fallback (if supported)
    if (this.deviceProfile.gpu?.supports_webgpu && gpuLoad < 0.8) {
      const webgpuShard = this.config.shards.webgpu_rombos_coder_qwen7b;
      if (webgpuShard) {
        return {
          device: 'igpu-0',
          engine: 'webgpu-rombos',
          backend: 'webllm',
          args: {
            adapter: 'webgpu',
            manifestUrl: webgpuShard.manifest
          }
        };
      }
    }

    // Rule 4: Queue if everything is busy
    if (cpuLoad >= policy.cpu_threshold_load && gpuLoad >= 0.8) {
      return {
        device: 'queued',
        engine: 'pending',
        delay_ms: 500
      };
    }

    // Default: CPU
    return {
      device: 'cpu-main',
      engine: 'llama.cpp',
      backend: shard.backend,
      endpoint: shard.endpoint,
      args: {
        threads: 4,
        model: shard.model_file
      }
    };
  }

  /**
   * Execute job on selected device
   */
  async executeJob(decision, job) {
    if (decision.device === 'queued') {
      // Queue and retry
      await this.sleep(decision.delay_ms || 500);
      return this.scheduleRombosJob(job, job.priority || 0.9);
    }

    if (decision.device === 'cpu-main' || decision.device === 'dgpu-0') {
      // Use HTTP endpoint (Ollama/llama.cpp)
      return await this.executeHTTP(decision, job);
    }

    if (decision.device === 'igpu-0' && decision.engine === 'webgpu-rombos') {
      // Use WebGPU path
      return await this.executeWebGPU(decision, job);
    }

    throw new Error(`Unknown device: ${decision.device}`);
  }

  /**
   * Execute via HTTP (Ollama/llama.cpp)
   */
  async executeHTTP(decision, job) {
    const response = await fetch(decision.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: decision.args.model,
        prompt: job.prompt,
        options: {
          num_thread: decision.args.threads,
          num_gpu: decision.args.gpu_layers || 0,
          temperature: job.temperature || 0.2,
          top_p: job.top_p || 0.9
        },
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    return json.response || json.text || json;
  }

  /**
   * Execute via WebGPU
   */
  async executeWebGPU(decision, job) {
    if (!window.ROMBOS_WEBGPU) {
      throw new Error('WebGPU adapter not initialized');
    }

    if (!window.ROMBOS_WEBGPU.ready) {
      await window.ROMBOS_WEBGPU.init();
    }

    const result = await window.ROMBOS_WEBGPU.infer(job.prompt, {
      temperature: job.temperature || 0.2,
      top_p: job.top_p || 0.9,
      max_tokens: job.max_tokens || 512
    });

    return result;
  }

  /**
   * Update system state (mock for now)
   */
  async updateSystemState() {
    // In real implementation, this would query actual system metrics
    // For now, use random mock data
    this.systemState.cpu.load = Math.random() * 0.8;
    this.systemState.gpu.load = Math.random() * 0.6;
    this.systemState.memory.used_mb = 8000 + Math.random() * 4000;
    this.systemState.memory.total_mb = this.deviceProfile.memory_mb;
  }

  /**
   * Start monitoring loop
   */
  startMonitoring() {
    setInterval(() => {
      this.updateSystemState();
    }, 5000); // Update every 5 seconds

    console.log('[K\'UHUL] Monitoring started');
  }

  /**
   * Update average latency metric
   */
  updateAvgLatency(latency) {
    const n = this.metrics.successful_jobs;
    this.metrics.avg_latency_ms = ((this.metrics.avg_latency_ms * (n - 1)) + latency) / n;
  }

  /**
   * Get scheduler metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      device_profile: this.deviceProfile.id,
      system_state: this.systemState,
      success_rate: this.metrics.total_jobs > 0
        ? (this.metrics.successful_jobs / this.metrics.total_jobs * 100).toFixed(1) + '%'
        : '0%'
    };
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global K'UHUL scheduler call function
 */
async function kuhulRombosCall(prompt, context = {}) {
  if (!window.KUHUL_SCHEDULER) {
    window.KUHUL_SCHEDULER = new KuhulScheduler();
    await window.KUHUL_SCHEDULER.init();
  }

  const job = {
    type: context.type || 'inference',
    prompt: prompt,
    model: context.model || 'Q4_K_M',
    temperature: context.temperature || 0.2,
    top_p: context.top_p || 0.9,
    max_tokens: context.max_tokens || 512,
    priority: context.priority || 0.9
  };

  return await window.KUHUL_SCHEDULER.scheduleRombosJob(job, job.priority);
}

// Export for Node.js / ESM
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KuhulScheduler, kuhulRombosCall };
}
