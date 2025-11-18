/**
 * KLH (K'uhul Logic Hive) Orchestrator
 * Manages multi-shard architecture, tape routing, and hive coordination
 *
 * Features:
 * - Multi-hive management
 * - Tape routing and mounting
 * - Inter-shard communication
 * - Resource allocation
 * - Agent delegation
 */

class KLHOrchestrator {
  constructor() {
    this.hives = new Map();
    this.tapes = new Map();
    this.routes = new Map();
    this.agents = new Map();
    this.hiveMatrix = {};
  }

  /**
   * Register a new hive (shard)
   */
  registerHive(hiveId, config) {
    if (this.hives.has(hiveId)) {
      throw new Error(`Hive ${hiveId} already registered`);
    }

    const hive = {
      id: hiveId,
      name: config.name || hiveId,
      port: config.port,
      status: 'offline',
      tapes: new Set(),
      agents: new Set(),
      flashRAM: {},
      db: null,
      created: new Date().toISOString()
    };

    this.hives.set(hiveId, hive);
    this.hiveMatrix[hiveId] = config.port;

    return hive;
  }

  /**
   * Start a hive
   */
  startHive(hiveId) {
    const hive = this.hives.get(hiveId);
    if (!hive) {
      throw new Error(`Hive ${hiveId} not found`);
    }

    hive.status = 'online';
    console.log(`[KLH] Hive ${hiveId} started on port ${hive.port}`);

    return hive;
  }

  /**
   * Stop a hive
   */
  stopHive(hiveId) {
    const hive = this.hives.get(hiveId);
    if (!hive) {
      throw new Error(`Hive ${hiveId} not found`);
    }

    hive.status = 'offline';
    console.log(`[KLH] Hive ${hiveId} stopped`);

    return hive;
  }

  /**
   * Register a tape
   */
  registerTape(tapeId, config) {
    if (this.tapes.has(tapeId)) {
      throw new Error(`Tape ${tapeId} already registered`);
    }

    const tape = {
      id: tapeId,
      name: config.name || tapeId,
      path: config.path,
      hiveId: null,
      status: 'unmounted',
      agents: config.agents || [],
      routes: config.routes || [],
      db: config.db || null,
      brains: config.brains || [],
      ui: config.ui || null,
      metadata: config.metadata || {},
      created: new Date().toISOString()
    };

    this.tapes.set(tapeId, tape);

    return tape;
  }

  /**
   * Mount tape to hive
   */
  mountTape(tapeId, hiveId) {
    const tape = this.tapes.get(tapeId);
    const hive = this.hives.get(hiveId);

    if (!tape) {
      throw new Error(`Tape ${tapeId} not found`);
    }

    if (!hive) {
      throw new Error(`Hive ${hiveId} not found`);
    }

    // Mount tape
    tape.hiveId = hiveId;
    tape.status = 'mounted';
    hive.tapes.add(tapeId);

    // Register tape routes
    for (const route of tape.routes) {
      this.registerRoute(route.path, tapeId, hiveId, route.handler);
    }

    // Register tape agents
    for (const agent of tape.agents) {
      this.registerAgent(agent.id, tapeId, hiveId, agent);
    }

    console.log(`[KLH] Tape ${tapeId} mounted to Hive ${hiveId}`);

    return tape;
  }

  /**
   * Unmount tape from hive
   */
  unmountTape(tapeId) {
    const tape = this.tapes.get(tapeId);

    if (!tape) {
      throw new Error(`Tape ${tapeId} not found`);
    }

    if (!tape.hiveId) {
      throw new Error(`Tape ${tapeId} is not mounted`);
    }

    const hive = this.hives.get(tape.hiveId);
    if (hive) {
      hive.tapes.delete(tapeId);
    }

    tape.hiveId = null;
    tape.status = 'unmounted';

    console.log(`[KLH] Tape ${tapeId} unmounted`);

    return tape;
  }

  /**
   * Register route
   */
  registerRoute(path, tapeId, hiveId, handler) {
    const routeKey = `${hiveId}:${path}`;

    this.routes.set(routeKey, {
      path,
      tapeId,
      hiveId,
      handler,
      registered: new Date().toISOString()
    });
  }

  /**
   * Route request
   */
  route(hiveId, path, data) {
    const routeKey = `${hiveId}:${path}`;
    const route = this.routes.get(routeKey);

    if (!route) {
      throw new Error(`Route ${path} not found in hive ${hiveId}`);
    }

    if (typeof route.handler === 'function') {
      return route.handler(data);
    }

    return route.handler;
  }

  /**
   * Register agent
   */
  registerAgent(agentId, tapeId, hiveId, config) {
    const agent = {
      id: agentId,
      tapeId,
      hiveId,
      type: config.type || 'generic',
      status: 'idle',
      tasks: [],
      config,
      registered: new Date().toISOString()
    };

    this.agents.set(agentId, agent);

    const hive = this.hives.get(hiveId);
    if (hive) {
      hive.agents.add(agentId);
    }

    return agent;
  }

  /**
   * Delegate task to agent
   */
  delegateTask(agentId, task) {
    const agent = this.agents.get(agentId);

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.status = 'busy';
    agent.tasks.push({
      ...task,
      started: new Date().toISOString()
    });

    console.log(`[KLH] Task delegated to agent ${agentId}`);

    return agent;
  }

  /**
   * Inter-hive communication
   */
  sendToHive(sourceHiveId, targetHiveId, message) {
    const sourceHive = this.hives.get(sourceHiveId);
    const targetHive = this.hives.get(targetHiveId);

    if (!sourceHive) {
      throw new Error(`Source hive ${sourceHiveId} not found`);
    }

    if (!targetHive) {
      throw new Error(`Target hive ${targetHiveId} not found`);
    }

    if (targetHive.status !== 'online') {
      throw new Error(`Target hive ${targetHiveId} is offline`);
    }

    console.log(`[KLH] Message sent from ${sourceHiveId} to ${targetHiveId}`);

    return {
      from: sourceHiveId,
      to: targetHiveId,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get hive matrix map
   */
  getHiveMatrix() {
    return {
      ...this.hiveMatrix,
      hives: Array.from(this.hives.values()).map(h => ({
        id: h.id,
        name: h.name,
        port: h.port,
        status: h.status,
        tapeCount: h.tapes.size,
        agentCount: h.agents.size
      }))
    };
  }

  /**
   * Get tape info
   */
  getTapeInfo(tapeId) {
    const tape = this.tapes.get(tapeId);
    if (!tape) {
      return null;
    }

    return {
      ...tape,
      hive: tape.hiveId ? this.hives.get(tape.hiveId)?.name : null
    };
  }

  /**
   * Get hive info
   */
  getHiveInfo(hiveId) {
    const hive = this.hives.get(hiveId);
    if (!hive) {
      return null;
    }

    return {
      ...hive,
      tapes: Array.from(hive.tapes).map(tid => this.tapes.get(tid)?.name),
      agents: Array.from(hive.agents).map(aid => this.agents.get(aid)?.id)
    };
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      hives: this.hives.size,
      tapes: this.tapes.size,
      agents: this.agents.size,
      routes: this.routes.size,
      onlineHives: Array.from(this.hives.values()).filter(h => h.status === 'online').length,
      mountedTapes: Array.from(this.tapes.values()).filter(t => t.status === 'mounted').length
    };
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KLHOrchestrator;
}
