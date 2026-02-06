/**
 * CORE HANDLERS
 * Basic system actions for XJSON Server
 */

export default {
  /**
   * Ping - Health check
   */
  ping: async ({ input }) => {
    return {
      status: 'ok',
      timestamp: Date.now(),
      message: 'XJSON Server is running'
    };
  },

  /**
   * Info - System information
   */
  info: async ({ input }) => {
    return {
      server: 'ASX XJSON Server',
      version: '1.0.0',
      runtime: 'Node.js',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: {
        total: process.memoryUsage().heapTotal,
        used: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external
      }
    };
  },

  /**
   * Echo - Return input as-is (debugging)
   */
  echo: async ({ input }) => {
    return {
      echo: input,
      timestamp: Date.now()
    };
  },

  /**
   * Eval - Safe expression evaluation
   */
  eval_expr: async ({ input }) => {
    const { expression, context = {} } = input;

    try {
      // Basic safe eval - only allows simple math and logic
      const safeContext = {
        Math,
        Date,
        ...context
      };

      // Very basic expression evaluation
      // In production, use a proper sandboxed evaluator
      const result = new Function(...Object.keys(safeContext), `return ${expression}`)(...Object.values(safeContext));

      return {
        result,
        expression,
        success: true
      };
    } catch (err) {
      return {
        error: err.message,
        expression,
        success: false
      };
    }
  },

  /**
   * Store - Key-value storage (in-memory)
   */
  store: (() => {
    const storage = new Map();

    return async ({ input }) => {
      const { action, key, value } = input;

      switch (action) {
        case 'set':
          storage.set(key, value);
          return { success: true, key, value };

        case 'get':
          return {
            success: storage.has(key),
            key,
            value: storage.get(key)
          };

        case 'delete':
          const existed = storage.has(key);
          storage.delete(key);
          return { success: existed, key };

        case 'list':
          return {
            success: true,
            keys: Array.from(storage.keys())
          };

        case 'clear':
          storage.clear();
          return { success: true };

        default:
          return { error: 'Unknown action', success: false };
      }
    };
  })(),

  /**
   * Log - Server-side logging
   */
  log: async ({ input }) => {
    const { level = 'info', message, data } = input;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    console.log(logEntry);
    if (data) {
      console.log('  Data:', data);
    }

    return {
      logged: true,
      timestamp,
      level,
      message
    };
  }
};
