/**
 * GHOST HANDLERS
 * GHOST v3 protocol integration - tape discovery and routing
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TAPES_DIR = path.resolve(__dirname, '../../tapes');

// Tape registry
let tapeRegistry = null;

// Load all tapes
const loadTapes = async () => {
  if (!tapeRegistry) {
    tapeRegistry = new Map();

    try {
      const tapesDirExists = await fs.pathExists(TAPES_DIR);
      if (!tapesDirExists) {
        console.warn('Tapes directory not found:', TAPES_DIR);
        return tapeRegistry;
      }

      const entries = await fs.readdir(TAPES_DIR, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const tapeJsonPath = path.join(TAPES_DIR, entry.name, 'tape.json');
        if (await fs.pathExists(tapeJsonPath)) {
          try {
            const tapeData = await fs.readJson(tapeJsonPath);
            tapeRegistry.set(tapeData.id || entry.name, {
              ...tapeData,
              path: path.join(TAPES_DIR, entry.name)
            });
          } catch (err) {
            console.warn(`Failed to load tape ${entry.name}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error('Error loading tapes:', err);
    }
  }

  return tapeRegistry;
};

export default {
  /**
   * List - List all available tapes
   */
  ghost_list: async ({ input }) => {
    const registry = await loadTapes();

    const tapes = Array.from(registry.values()).map(tape => ({
      id: tape.id,
      name: tape.name,
      version: tape.version,
      description: tape.description,
      runtime: tape.runtime,
      agents: tape.agents?.length || 0,
      blocks: tape.blocks?.length || 0
    }));

    return {
      total: tapes.length,
      tapes
    };
  },

  /**
   * Get - Get specific tape details
   */
  ghost_get: async ({ input }) => {
    const { tape_id } = input;
    const registry = await loadTapes();

    const tape = registry.get(tape_id);
    if (!tape) {
      return {
        error: 'Tape not found',
        tape_id,
        available: Array.from(registry.keys())
      };
    }

    return {
      success: true,
      tape
    };
  },

  /**
   * Launch - Launch a tape
   */
  ghost_launch: async ({ input }) => {
    const { tape_id, context = {} } = input;
    const registry = await loadTapes();

    const tape = registry.get(tape_id);
    if (!tape) {
      return {
        error: 'Tape not found',
        tape_id
      };
    }

    // Mock launch - in production, initialize tape runtime
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      session_id: sessionId,
      tape_id,
      tape_name: tape.name,
      status: 'launched',
      context
    };
  },

  /**
   * Route - Route request to tape
   */
  ghost_route: async ({ input }) => {
    const { tape_id, endpoint, method = 'GET', payload = {} } = input;
    const registry = await loadTapes();

    const tape = registry.get(tape_id);
    if (!tape) {
      return {
        error: 'Tape not found',
        tape_id
      };
    }

    // Mock routing - in production, route to actual tape handler
    return {
      tape_id,
      endpoint,
      method,
      response: {
        message: `Routed to ${tape.name}`,
        endpoint,
        note: 'Tape routing not yet fully implemented'
      }
    };
  },

  /**
   * Discover - Auto-discover tapes
   */
  ghost_discover: async ({ input }) => {
    const { rescan = false } = input;

    if (rescan) {
      tapeRegistry = null;
    }

    const registry = await loadTapes();

    return {
      discovered: registry.size,
      tapes: Array.from(registry.keys()),
      timestamp: Date.now()
    };
  },

  /**
   * Swarm - Create tape swarm
   */
  ghost_swarm: async ({ input }) => {
    const { tapes, task, mode = 'parallel' } = input;
    const registry = await loadTapes();

    const results = [];

    for (const tapeId of tapes) {
      const tape = registry.get(tapeId);
      if (!tape) {
        results.push({
          tape_id: tapeId,
          error: 'Tape not found'
        });
        continue;
      }

      // Mock swarm execution
      results.push({
        tape_id: tapeId,
        tape_name: tape.name,
        status: 'completed',
        result: `${tape.name} processed task`
      });
    }

    return {
      task,
      mode,
      total_tapes: tapes.length,
      results
    };
  },

  /**
   * Status - Get GHOST protocol status
   */
  ghost_status: async ({ input }) => {
    const registry = await loadTapes();

    return {
      protocol: 'GHOST v3',
      status: 'online',
      tapes_loaded: registry.size,
      tapes_dir: TAPES_DIR,
      features: [
        'tape_discovery',
        'auto_routing',
        'swarm_coordination',
        'multi_agent'
      ]
    };
  }
};
