/*
======================================================
  MICRONAUT × K'UHUL – UNIFIED RUNTIME ENGINE (v2)
======================================================

BACKEND-AGNOSTIC CORE:
• Works in browser-only mode (WebGPU, IndexedDB)
• Works with XJSON Server (Node.js via NPX) ← PRIMARY
• Works with static hosting (GitHub Pages, Netlify)
• PHP/FastAPI are OPTIONAL legacy adapters

Runtime Targets:
✓ Browser (standalone)
✓ Service Worker
✓ iframe sandbox
✓ ASX Tapes
✓ XJSON Server (Node.js)
✓ (Optional) PHP/FastAPI bridges

NO BACKEND DEPENDENCIES BY DEFAULT.
======================================================
*/

window.MICRONAUT_KUHUL = (function() {
  'use strict';

  // ======================================================
  // 1. SYSTEM PROFILER (Device Detection)
  // ======================================================
  const SystemProfiler = {
    profile: {
      cpu: { load: 0, score: 1.0, cores: navigator.hardwareConcurrency || 4 },
      igpu: { load: 0, score: 0.3, available: false },
      dgpu: { available: false, vendor: null },
      webgpu: false,
      ram_mb: (navigator.deviceMemory || 4) * 1024,
      storage: 'indexeddb',
      initialized: false
    },

    async init() {
      // Detect WebGPU
      this.profile.webgpu = ('gpu' in navigator);

      if (this.profile.webgpu) {
        try {
          const adapter = await navigator.gpu.requestAdapter();
          if (adapter) {
            this.profile.igpu.available = true;
            this.profile.igpu.score = 0.5;
          }
        } catch (err) {
          console.warn('[PROFILER] WebGPU adapter failed:', err);
        }
      }

      // Estimate CPU load (simple heuristic)
      this.profile.cpu.load = 0.1;

      this.profile.initialized = true;
      console.log('[MICRONAUT×K\'UHUL] System profile:', this.profile);
      return this.profile;
    },

    getProfile() {
      return this.profile;
    }
  };

  // ======================================================
  // 2. SCXQ2 CODEC (Compression/Decompression)
  // ======================================================
  const SCXQ2 = {
    encode(data) {
      try {
        const json = JSON.stringify(data);
        const utf8 = new TextEncoder().encode(json);

        // Simple base64 encoding (replace with pako.deflate for real compression)
        const base64 = btoa(String.fromCharCode(...utf8));
        return base64;
      } catch (err) {
        console.error('[SCXQ2] Encode failed:', err);
        return null;
      }
    },

    decode(glyphStr) {
      try {
        const binary = atob(glyphStr);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const json = new TextDecoder().decode(bytes);
        return JSON.parse(json);
      } catch (err) {
        console.error('[SCXQ2] Decode failed:', err);
        return null;
      }
    }
  };

  // ======================================================
  // 3. FRACTAL-OS LOADER (XJSON Glyph Loader)
  // ======================================================
  const FractalOS = {
    cache: new Map(),

    async loadGlyph(url) {
      if (this.cache.has(url)) {
        return this.cache.get(url);
      }

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const glyph = await res.text();
        const data = SCXQ2.decode(glyph);

        this.cache.set(url, data);
        return data;
      } catch (err) {
        console.error('[FRACTAL-OS] Load failed:', url, err);
        return null;
      }
    },

    async loadOS(manifestURL) {
      const os = await this.loadGlyph(manifestURL);
      console.log('[FRACTAL-OS] Loaded:', os);
      window.FRACTAL = os;
      return os;
    },

    clearCache() {
      this.cache.clear();
    }
  };

  // ======================================================
  // 4. XCFE (eXecutable Control Flow Engine)
  // ======================================================
  const XCFE = {
    async run(block, ctx = {}) {
      if (!block || typeof block !== 'object') return null;

      // @if condition
      if (block["@if"]) {
        const cond = this.evaluate(block["@if"], ctx);
        if (cond && block["@then"]) {
          return await this.run(block["@then"], ctx);
        } else if (!cond && block["@else"]) {
          return await this.run(block["@else"], ctx);
        }
        return null;
      }

      // @do action
      if (block["@do"]) {
        return await this.action(block["@do"], ctx);
      }

      // @set state
      if (block["@set"]) {
        const [key, value] = block["@set"];
        const resolved = this.evaluate(value, ctx);
        this.setPath(ctx, key, resolved);
        return resolved;
      }

      // @call backend
      if (block["@call"]) {
        return await this.callBackend(block["@call"], ctx);
      }

      return null;
    },

    evaluate(expr, ctx) {
      if (typeof expr === 'string') {
        if (expr.startsWith('$')) {
          return this.getPath(ctx, expr);
        }
        return expr;
      }

      if (typeof expr === 'number' || typeof expr === 'boolean') {
        return expr;
      }

      if (Array.isArray(expr)) {
        return expr.map(e => this.evaluate(e, ctx));
      }

      if (typeof expr === 'object' && expr !== null) {
        const keys = Object.keys(expr);
        if (keys.length === 1) {
          const op = keys[0];
          const args = expr[op];
          return this.evaluateOp(op, args, ctx);
        }
      }

      return expr;
    },

    evaluateOp(op, args, ctx) {
      const evalArgs = Array.isArray(args)
        ? args.map(a => this.evaluate(a, ctx))
        : this.evaluate(args, ctx);

      switch (op) {
        case '+': return evalArgs[0] + evalArgs[1];
        case '-': return evalArgs[0] - evalArgs[1];
        case '*': return evalArgs[0] * evalArgs[1];
        case '/': return evalArgs[0] / evalArgs[1];
        case '%': return evalArgs[0] % evalArgs[1];
        case '==': return evalArgs[0] === evalArgs[1];
        case '!=': return evalArgs[0] !== evalArgs[1];
        case '>': return evalArgs[0] > evalArgs[1];
        case '<': return evalArgs[0] < evalArgs[1];
        case '>=': return evalArgs[0] >= evalArgs[1];
        case '<=': return evalArgs[0] <= evalArgs[1];
        case 'and': return evalArgs[0] && evalArgs[1];
        case 'or': return evalArgs[0] || evalArgs[1];
        case 'not': return !evalArgs[0];
        default:
          console.warn('[XCFE] Unknown operator:', op);
          return null;
      }
    },

    getPath(obj, path) {
      const parts = path.replace(/^\$/, '').split('.');
      let current = obj;
      for (const part of parts) {
        if (current == null) return undefined;
        current = current[part];
      }
      return current;
    },

    setPath(obj, path, value) {
      const parts = path.replace(/^\$/, '').split('.');
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current)) {
          current[part] = {};
        }
        current = current[part];
      }
      current[parts[parts.length - 1]] = value;
    },

    async action(name, ctx) {
      switch (name) {
        case 'llm.call':
          return await Micronaut.dispatchLLM(ctx);

        case 'log':
          console.log('[XCFE]', ctx.msg || ctx);
          return ctx.msg || ctx;

        case 'storage.save':
          return await this.storageSave(ctx);

        case 'storage.load':
          return await this.storageLoad(ctx);

        default:
          console.warn('[XCFE] Unknown action:', name);
          return null;
      }
    },

    async callBackend(endpoint, ctx) {
      return await BackendRouter.call(endpoint, ctx);
    },

    async storageSave(ctx) {
      const key = ctx.key || 'state';
      const value = ctx.value || ctx.state;
      localStorage.setItem(key, JSON.stringify(value));
      return { ok: true };
    },

    async storageLoad(ctx) {
      const key = ctx.key || 'state';
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  };

  // ======================================================
  // 5. BACKEND ROUTER (Tries multiple backends)
  // ======================================================
  const BackendRouter = {
    backends: [
      { name: 'xjson-server', url: 'http://localhost:3000/xjson/run', priority: 10 },
      { name: 'xjson-server-alt', url: 'http://localhost:3001/xjson/run', priority: 9 },
      { name: 'browser-fallback', url: null, priority: 1 }
    ],

    async call(endpoint, payload) {
      // Try XJSON servers first
      for (const backend of this.backends) {
        if (!backend.url) continue;

        try {
          const res = await fetch(backend.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              program: { type: endpoint, input: payload },
              context: payload
            }),
            timeout: 5000
          });

          if (res.ok) {
            const data = await res.json();
            console.log(`[BACKEND] ${backend.name} responded:`, data);
            return data.result || data;
          }
        } catch (err) {
          console.warn(`[BACKEND] ${backend.name} failed:`, err.message);
        }
      }

      // Fallback to browser-only
      console.log('[BACKEND] All servers down, using browser fallback');
      return await this.browserFallback(endpoint, payload);
    },

    async browserFallback(endpoint, payload) {
      // Simple browser-only implementations
      switch (endpoint) {
        case 'kuhul.echo':
          return { last_response: `Browser echo: ${JSON.stringify(payload)}` };

        case 'micronaut.infer':
          return { text: '[Browser-only Micronaut stub]' };

        default:
          return { ok: false, error: 'No backend available' };
      }
    }
  };

  // ======================================================
  // 6. KLH (Hive Router)
  // ======================================================
  const KLH = {
    routes: new Map(),

    register(id, handler) {
      this.routes.set(id, handler);
      console.log('[KLH] Registered route:', id);
    },

    async send(id, payload) {
      if (!this.routes.has(id)) {
        console.warn('[KLH] Unknown route:', id);
        return null;
      }
      return await this.routes.get(id)(payload);
    },

    async broadcast(payload) {
      const results = [];
      for (const [id, handler] of this.routes) {
        try {
          results.push({ id, result: await handler(payload) });
        } catch (err) {
          results.push({ id, error: err.message });
        }
      }
      return results;
    }
  };

  // ======================================================
  // 7. MICRONAUT (Multi-Agent System)
  // ======================================================
  const Micronaut = {
    agents: new Map(),

    register(id, agent) {
      this.agents.set(id, agent);
      console.log('[MICRONAUT] Registered agent:', id);
    },

    selectAgent(task) {
      const entries = Array.from(this.agents.values());

      // Score agents by specialization
      const scored = entries.map(agent => ({
        agent,
        score: agent.score ? agent.score(task) : 0.5
      }));

      // Sort by score (highest first)
      scored.sort((a, b) => b.score - a.score);

      return scored[0]?.agent || null;
    },

    async dispatchLLM(ctx) {
      const agent = this.selectAgent({ type: 'llm', ctx });

      if (!agent) {
        console.warn('[MICRONAUT] No LLM agent available');
        return { error: 'No LLM agent available' };
      }

      return await agent.run(ctx);
    },

    async dispatch(taskType, payload) {
      const agent = this.selectAgent({ type: taskType, payload });
      if (!agent) return { error: 'No suitable agent' };
      return await agent.run(payload);
    }
  };

  // ======================================================
  // 8. K'UHUL SCHEDULER (Device Routing)
  // ======================================================
  const KUHUL = {
    system: SystemProfiler.profile,

    routeLLM(job) {
      const cpu = this.system.cpu.load;
      const gpu = this.system.igpu.load;
      const hasWebGPU = this.system.webgpu;

      // 1) CPU preferred (GGUF/Q4_K_M models)
      if (cpu < 0.75) {
        return {
          device: 'cpu',
          reason: 'CPU preferred for GGUF',
          backend: 'browser'
        };
      }

      // 2) WebGPU fallback
      if (hasWebGPU && gpu < 0.8) {
        return {
          device: 'webgpu',
          reason: 'WebGPU acceleration available',
          backend: 'webgpu'
        };
      }

      // 3) Queue it
      return { device: 'queued', delay: 500 };
    },

    async scheduleJob(job, priority = 0.9) {
      const plan = this.routeLLM(job);

      if (plan.device === 'queued') {
        await new Promise(r => setTimeout(r, plan.delay));
        return this.scheduleJob(job, priority);
      }

      return plan;
    }
  };

  // ======================================================
  // 9. EXAMPLE AGENT: Browser LLM Agent
  // ======================================================
  class BrowserLLMAgent {
    constructor(id, opts = {}) {
      this.id = id;
      this.model = opts.model || 'micronaut-stub';
      this.backend = opts.backend || 'browser';
    }

    score(task) {
      return 0.7; // Medium priority
    }

    async run(ctx) {
      const plan = KUHUL.routeLLM(ctx);

      console.log(`[${this.id}] Running on ${plan.device}`);

      if (plan.device === 'cpu' || plan.device === 'browser') {
        return this.browserInfer(ctx);
      }

      if (plan.device === 'webgpu') {
        return this.webgpuInfer(ctx);
      }

      return { error: 'Unknown device' };
    }

    async browserInfer(ctx) {
      // Try XJSON server first
      try {
        const result = await BackendRouter.call('micronaut.infer', ctx);
        return result;
      } catch (err) {
        // Fallback to stub
        return {
          text: `[Browser stub] Echo: ${ctx.prompt?.substring(0, 50)}...`,
          backend: 'browser-fallback'
        };
      }
    }

    async webgpuInfer(ctx) {
      if (window.ROMBOS_WEBGPU && window.ROMBOS_WEBGPU.ready) {
        return await window.ROMBOS_WEBGPU.infer(ctx.prompt, ctx);
      }
      return { error: 'WebGPU not initialized' };
    }
  }

  // ======================================================
  // 10. BOOT SEQUENCE
  // ======================================================
  async function boot() {
    console.log('======================================');
    console.log('   MICRONAUT × K\'UHUL RUNTIME v2    ');
    console.log('   Backend-Agnostic • Browser-First  ');
    console.log('======================================');

    // 1. Initialize system profiler
    await SystemProfiler.init();

    // 2. Register default agent
    Micronaut.register('browser-llm', new BrowserLLMAgent('browser-llm', {
      model: 'micronaut-browser',
      backend: 'xjson-server'
    }));

    // 3. Register default KLH routes
    KLH.register('llm.default', async (p) => Micronaut.dispatchLLM(p));
    KLH.register('system.info', async () => SystemProfiler.getProfile());

    console.log('[BOOT] Runtime ready');
    console.log('[BOOT] Backends:', BackendRouter.backends.map(b => b.name));
    console.log('[BOOT] System:', SystemProfiler.profile);

    return {
      ready: true,
      profile: SystemProfiler.profile,
      backends: BackendRouter.backends
    };
  }

  // ======================================================
  // PUBLIC API
  // ======================================================
  return {
    boot,
    SCXQ2,
    FractalOS,
    XCFE,
    KLH,
    Micronaut,
    KUHUL,
    BackendRouter,
    SystemProfiler,
    BrowserLLMAgent
  };
})();

// Auto-boot on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.MICRONAUT_KUHUL.boot();
  });
} else {
  window.MICRONAUT_KUHUL.boot();
}
