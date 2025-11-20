/**
 * KHL UNIFIED RUNTIME
 * K'uhul Hyper Language - Complete ASX execution environment
 *
 * No PHP required. No build step. Pure runtime.
 *
 * Features:
 * - Backend-agnostic (XJSON Server → Browser fallback)
 * - Tape loading and execution
 * - Agent coordination
 * - Block rendering
 * - State management
 * - GHOST protocol integration
 * - K'UHUL device routing
 * - Micronaut AI
 */

class KHL {
  constructor(config = {}) {
    this.config = {
      backends: config.backends || [
        { name: 'xjson-server', url: 'http://localhost:3000/xjson/run', priority: 10 },
        { name: 'xjson-server-alt', url: 'http://localhost:3001/xjson/run', priority: 9 },
        { name: 'browser-fallback', url: null, priority: 1 }
      ],
      autoDiscoverTapes: config.autoDiscoverTapes !== false,
      enableWebGPU: config.enableWebGPU !== false,
      debug: config.debug || false
    };

    this.state = {
      initialized: false,
      tapes: new Map(),
      agents: new Map(),
      blocks: new Map(),
      sessions: new Map()
    };

    this.runtime = {
      backend: null,
      mode: null,
      capabilities: {}
    };
  }

  /**
   * Initialize KHL runtime
   */
  async init() {
    if (this.state.initialized) return this;

    this.log('Initializing KHL Unified Runtime...');

    // 1. Detect best backend
    await this.detectBackend();

    // 2. Load browser fallback if needed
    if (this.runtime.mode === 'browser') {
      await window.BrowserFallback.init();
    }

    // 3. Discover tapes
    if (this.config.autoDiscoverTapes) {
      await this.discoverTapes();
    }

    // 4. Initialize Micronaut if available
    if (typeof window.MICRONAUT_KUHUL !== 'undefined') {
      await window.MICRONAUT_KUHUL.init();
    }

    this.state.initialized = true;
    this.log('KHL Runtime initialized', this.runtime);

    return this;
  }

  /**
   * Detect and select best backend
   */
  async detectBackend() {
    this.log('Detecting backends...');

    const sortedBackends = [...this.config.backends].sort((a, b) => b.priority - a.priority);

    for (const backend of sortedBackends) {
      if (!backend.url) {
        // Browser fallback
        this.runtime.backend = backend;
        this.runtime.mode = 'browser';
        this.log('Using browser-only fallback');
        return;
      }

      try {
        // Try to ping backend
        const response = await fetch(backend.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            program: { type: 'ping', input: {} }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.ok || data.result?.status === 'ok') {
            this.runtime.backend = backend;
            this.runtime.mode = 'server';
            this.log(`Connected to ${backend.name}`, backend.url);
            return;
          }
        }
      } catch (err) {
        this.log(`${backend.name} unavailable:`, err.message);
      }
    }

    // Default to browser fallback
    this.runtime.backend = sortedBackends[sortedBackends.length - 1];
    this.runtime.mode = 'browser';
    this.log('Defaulting to browser-only mode');
  }

  /**
   * Call backend (with automatic routing)
   */
  async call(endpoint, payload = {}) {
    if (this.runtime.mode === 'server') {
      try {
        const response = await fetch(this.runtime.backend.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            program: { type: endpoint, input: payload }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.result || data;
      } catch (err) {
        this.log(`Server call failed, falling back to browser:`, err.message);
        // Fall back to browser
        return await window.BrowserFallback.call(endpoint, payload);
      }
    } else {
      // Browser-only mode
      return await window.BrowserFallback.call(endpoint, payload);
    }
  }

  /**
   * Discover tapes via GHOST protocol
   */
  async discoverTapes() {
    this.log('Discovering tapes...');

    try {
      const result = await this.call('ghost_list', {});

      if (result.tapes) {
        for (const tape of result.tapes) {
          this.state.tapes.set(tape.id, tape);
        }
        this.log(`Discovered ${result.tapes.length} tapes`);
      }
    } catch (err) {
      this.log('Tape discovery failed:', err.message);
    }

    return this.state.tapes;
  }

  /**
   * Load and launch a tape
   */
  async launchTape(tapeId, context = {}) {
    this.log(`Launching tape: ${tapeId}`);

    // Get tape details
    const result = await this.call('ghost_get', { tape_id: tapeId });

    if (result.error) {
      throw new Error(result.error);
    }

    const tape = result.tape;

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      id: sessionId,
      tape_id: tapeId,
      tape,
      context,
      state: {},
      started: Date.now()
    };

    this.state.sessions.set(sessionId, session);

    // Launch via GHOST
    await this.call('ghost_launch', {
      tape_id: tapeId,
      context
    });

    this.log(`Tape launched:`, sessionId);

    return session;
  }

  /**
   * Route AI task via K'UHUL
   */
  async routeAI(task, options = {}) {
    const { priority = 0.5, shard = 'llm_default' } = options;

    this.log(`Routing AI task: ${shard}`);

    const result = await this.call('kuhul_route', {
      shard,
      priority,
      job: task
    });

    return result;
  }

  /**
   * Call agent (single)
   */
  async callAgent(agentId, action, payload = {}) {
    this.log(`Calling agent: ${agentId}/${action}`);

    const result = await this.call('agents_call', {
      agent: agentId,
      action,
      payload
    });

    return result;
  }

  /**
   * Multi-judge tribunal evaluation
   */
  async tribunal(task, judges = ['cline', 'rombos'], timeout = 30000) {
    this.log(`Starting tribunal with ${judges.length} judges`);

    const result = await this.call('agents_tribunal', {
      task,
      judges,
      timeout
    });

    this.log(`Tribunal result: ${result.final_verdict} (${result.consensus})`);

    return result;
  }

  /**
   * Micronaut inference
   */
  async infer(prompt, options = {}) {
    const { max_tokens = 50, temperature = 0.7 } = options;

    this.log(`Micronaut inference: "${prompt.substring(0, 50)}..."`);

    const result = await this.call('micronaut_infer', {
      prompt,
      max_tokens,
      temperature
    });

    return result;
  }

  /**
   * Store data
   */
  async store(action, key, value = null) {
    return await this.call('store', { action, key, value });
  }

  /**
   * Read file
   */
  async readFile(path) {
    return await this.call('fs_read', { path });
  }

  /**
   * Write file
   */
  async writeFile(path, content) {
    return await this.call('fs_write', { path, content });
  }

  /**
   * Compress data
   */
  async compress(data) {
    return await this.call('scxq2_encode', { data });
  }

  /**
   * Decompress data
   */
  async decompress(compressed) {
    return await this.call('scxq2_decode', { compressed });
  }

  /**
   * Get runtime info
   */
  async info() {
    return await this.call('info', {});
  }

  /**
   * Get runtime status
   */
  getStatus() {
    return {
      initialized: this.state.initialized,
      mode: this.runtime.mode,
      backend: this.runtime.backend?.name,
      tapes: this.state.tapes.size,
      sessions: this.state.sessions.size,
      agents: this.state.agents.size
    };
  }

  /**
   * Logging helper
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[KHL]', ...args);
    }
  }
}

// Export for use in browser and Node.js
if (typeof window !== 'undefined') {
  window.KHL = KHL;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = KHL;
}

/**
 * USAGE EXAMPLES
 *
 * // Initialize
 * const khl = new KHL({ debug: true });
 * await khl.init();
 *
 * // Launch tape
 * const session = await khl.launchTape('cline_tape_v1');
 *
 * // Call agent
 * const result = await khl.callAgent('cline', 'analyze', { code: '...' });
 *
 * // Multi-judge evaluation
 * const verdict = await khl.tribunal('Review this code', ['cline', 'rombos']);
 *
 * // Micronaut inference
 * const completion = await khl.infer('The function returns');
 *
 * // Storage
 * await khl.store('set', 'mykey', { data: 123 });
 * const value = await khl.store('get', 'mykey');
 *
 * // Files
 * await khl.writeFile('/data/test.json', JSON.stringify({ hello: 'world' }));
 * const file = await khl.readFile('/data/test.json');
 *
 * // Compression
 * const compressed = await khl.compress({ large: 'data' });
 * const original = await khl.decompress(compressed.compressed);
 */
