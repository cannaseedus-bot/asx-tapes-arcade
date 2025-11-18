/**
 * ASX Tape System
 * Self-contained micro-OS modules with UI, DB, agents, brains, and logic
 *
 * Tape Structure:
 * tapes/<name>/
 *   tape.json         - Metadata and configuration
 *   brains/           - AI logic, ngrams, behavior loops
 *   agents/           - Micro-agents (Mx2PHP, Mx2SQL, etc.)
 *   db/               - Local database
 *   logs/             - Session logs
 *   public/           - UI (HTML/JS/CSS)
 *   route.js          - Backend entry point
 */

class TapeSystem {
  constructor(klh, xjsonRuntime) {
    this.klh = klh;
    this.xjson = xjsonRuntime;
    this.loadedTapes = new Map();
  }

  /**
   * Create a new tape
   */
  createTape(tapeId, config) {
    const tape = {
      id: tapeId,
      name: config.name || tapeId,
      version: config.version || '1.0.0',
      description: config.description || '',
      author: config.author || 'Anonymous',

      // Tape components
      brains: config.brains || [],
      agents: config.agents || [],
      routes: config.routes || [],
      ui: config.ui || null,

      // Resources
      db: {
        path: config.db?.path || `tapes/${tapeId}/db/asx-db.json`,
        data: config.db?.data || {}
      },

      logs: {
        path: config.db?.path || `tapes/${tapeId}/logs/`,
        entries: []
      },

      // Tape state
      state: config.state || {},
      flashRAM: config.flashRAM || {},

      // Metadata
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    this.loadedTapes.set(tapeId, tape);

    return tape;
  }

  /**
   * Load tape from configuration
   */
  loadTape(tapeConfig) {
    if (typeof tapeConfig === 'string') {
      tapeConfig = JSON.parse(tapeConfig);
    }

    const tapeId = tapeConfig.id;
    const tape = this.createTape(tapeId, tapeConfig);

    // Initialize tape components
    this.initializeBrains(tape);
    this.initializeAgents(tape);
    this.initializeRoutes(tape);

    console.log(`[Tape System] Loaded tape: ${tapeId}`);

    return tape;
  }

  /**
   * Mount tape to hive
   */
  mountToHive(tapeId, hiveId) {
    const tape = this.loadedTapes.get(tapeId);

    if (!tape) {
      throw new Error(`Tape ${tapeId} not loaded`);
    }

    // Register tape with KLH
    this.klh.registerTape(tapeId, {
      name: tape.name,
      path: `tapes/${tapeId}`,
      agents: tape.agents,
      routes: tape.routes,
      db: tape.db.path,
      brains: tape.brains,
      ui: tape.ui,
      metadata: {
        version: tape.version,
        description: tape.description,
        author: tape.author
      }
    });

    // Mount to hive
    this.klh.mountTape(tapeId, hiveId);

    console.log(`[Tape System] Mounted ${tapeId} to ${hiveId}`);

    return tape;
  }

  /**
   * Initialize tape brains
   */
  initializeBrains(tape) {
    for (const brain of tape.brains) {
      // Load brain logic
      brain.initialized = true;
      brain.state = {};

      console.log(`[Tape System] Initialized brain: ${brain.id}`);
    }
  }

  /**
   * Initialize tape agents
   */
  initializeAgents(tape) {
    for (const agent of tape.agents) {
      // Set up agent
      agent.status = 'ready';
      agent.tasks = [];

      console.log(`[Tape System] Initialized agent: ${agent.id}`);
    }
  }

  /**
   * Initialize tape routes
   */
  initializeRoutes(tape) {
    for (const route of tape.routes) {
      // Set up route handler
      if (typeof route.handler === 'string') {
        // If handler is K'uhul code
        const kuhulCode = route.handler;
        route.handler = (data) => {
          return this.xjson.interpreter.execute(kuhulCode);
        };
      }

      console.log(`[Tape System] Initialized route: ${route.path}`);
    }
  }

  /**
   * Execute tape action
   */
  executeTapeAction(tapeId, action, params) {
    const tape = this.loadedTapes.get(tapeId);

    if (!tape) {
      throw new Error(`Tape ${tapeId} not loaded`);
    }

    // Log action
    tape.logs.entries.push({
      action,
      params,
      timestamp: new Date().toISOString()
    });

    // Execute based on action type
    switch (action) {
      case 'brain':
        return this.executeBrain(tape, params);
      case 'agent':
        return this.executeAgent(tape, params);
      case 'route':
        return this.executeRoute(tape, params);
      case 'db':
        return this.executeDB(tape, params);
      default:
        throw new Error(`Unknown tape action: ${action}`);
    }
  }

  /**
   * Execute brain logic
   */
  executeBrain(tape, params) {
    const brain = tape.brains.find(b => b.id === params.brainId);

    if (!brain) {
      throw new Error(`Brain ${params.brainId} not found in tape ${tape.id}`);
    }

    // Execute brain logic
    if (brain.logic) {
      return this.xjson.execute(brain.logic);
    }

    return null;
  }

  /**
   * Execute agent task
   */
  executeAgent(tape, params) {
    const agent = tape.agents.find(a => a.id === params.agentId);

    if (!agent) {
      throw new Error(`Agent ${params.agentId} not found in tape ${tape.id}`);
    }

    // Delegate to KLH
    return this.klh.delegateTask(agent.id, params.task);
  }

  /**
   * Execute route
   */
  executeRoute(tape, params) {
    const route = tape.routes.find(r => r.path === params.path);

    if (!route) {
      throw new Error(`Route ${params.path} not found in tape ${tape.id}`);
    }

    if (typeof route.handler === 'function') {
      return route.handler(params.data);
    }

    return route.handler;
  }

  /**
   * Execute DB operation
   */
  executeDB(tape, params) {
    const { operation, collection, query, data } = params;

    switch (operation) {
      case 'read':
        return tape.db.data[collection] || [];

      case 'write':
        if (!tape.db.data[collection]) {
          tape.db.data[collection] = [];
        }
        tape.db.data[collection].push(data);
        return data;

      case 'update':
        // Simple update logic
        const items = tape.db.data[collection] || [];
        const index = items.findIndex(item =>
          Object.keys(query).every(key => item[key] === query[key])
        );
        if (index !== -1) {
          items[index] = { ...items[index], ...data };
          return items[index];
        }
        return null;

      case 'delete':
        if (tape.db.data[collection]) {
          tape.db.data[collection] = tape.db.data[collection].filter(item =>
            !Object.keys(query).every(key => item[key] === query[key])
          );
        }
        return true;

      default:
        throw new Error(`Unknown DB operation: ${operation}`);
    }
  }

  /**
   * Get tape state
   */
  getTapeState(tapeId) {
    const tape = this.loadedTapes.get(tapeId);
    if (!tape) {
      return null;
    }

    return {
      id: tape.id,
      name: tape.name,
      version: tape.version,
      state: tape.state,
      flashRAM: tape.flashRAM,
      brainCount: tape.brains.length,
      agentCount: tape.agents.length,
      routeCount: tape.routes.length,
      logCount: tape.logs.entries.length
    };
  }

  /**
   * Update tape state
   */
  updateTapeState(tapeId, newState) {
    const tape = this.loadedTapes.get(tapeId);
    if (!tape) {
      throw new Error(`Tape ${tapeId} not loaded`);
    }

    tape.state = { ...tape.state, ...newState };
    tape.modified = new Date().toISOString();

    return tape.state;
  }

  /**
   * Package tape as .asxtape file
   */
  packageTape(tapeId) {
    const tape = this.loadedTapes.get(tapeId);
    if (!tape) {
      throw new Error(`Tape ${tapeId} not loaded`);
    }

    return JSON.stringify(tape, null, 2);
  }

  /**
   * Unload tape
   */
  unloadTape(tapeId) {
    const tape = this.loadedTapes.get(tapeId);
    if (!tape) {
      return false;
    }

    // Unmount from hive if mounted
    if (tape.hiveId) {
      this.klh.unmountTape(tapeId);
    }

    this.loadedTapes.delete(tapeId);
    console.log(`[Tape System] Unloaded tape: ${tapeId}`);

    return true;
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TapeSystem;
}
