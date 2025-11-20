# 🔥 ASX XJSON SERVER

**THE PRIMARY BACKEND for ASX Tapes Arcade**

A lightweight Node.js server that provides REST APIs for the complete ASX ecosystem - no PHP required, browser-only fallback available.

## 🚀 Quick Start

```bash
# Install dependencies
cd xjson-server
npm install

# Start server
npm start

# Or use npx (no install needed)
npx asx-server
```

Server runs at: `http://localhost:3000`

## 📡 Architecture

The XJSON Server is **backend-agnostic by design**:

1. **Primary**: XJSON Server (Node.js, port 3000/3001)
2. **Fallback**: Browser-only mode (WebGPU, IndexedDB)
3. **Optional**: PHP (legacy cPanel adapter only)

The browser runtime tries backends in order and falls back gracefully.

## 🎯 Endpoints

### Core (`/xjson/run`)

Main execution endpoint - all requests go here:

```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "ping",
      "input": {}
    }
  }'
```

### Available Handlers

#### Core Operations
- `ping` - Health check
- `info` - System information
- `echo` - Echo input (debugging)
- `eval_expr` - Safe expression evaluation
- `store` - Key-value storage (set/get/delete/list/clear)
- `log` - Server-side logging

#### K'UHUL Scheduler
- `kuhul_profile` - Get device profile
- `kuhul_route` - Make routing decision
- `kuhul_schedule` - Schedule a job
- `kuhul_status` - Get scheduler status
- `kuhul_glyph` - Execute K'UHUL glyph program

#### Agents
- `agents_list` - List all available agents
- `agents_call` - Call specific agent
- `agents_tribunal` - Multi-judge evaluation
- `agents_swarm` - Coordinate multiple agents

#### Filesystem
- `fs_read` - Read file
- `fs_write` - Write file
- `fs_list` - List directory
- `fs_exists` - Check if path exists
- `fs_delete` - Delete file/directory
- `fs_copy` - Copy file/directory
- `fs_json_read` - Read JSON file
- `fs_json_write` - Write JSON file

#### GHOST Protocol
- `ghost_list` - List all tapes
- `ghost_get` - Get tape details
- `ghost_launch` - Launch tape
- `ghost_route` - Route to tape endpoint
- `ghost_discover` - Auto-discover tapes
- `ghost_swarm` - Create tape swarm
- `ghost_status` - GHOST status

#### SCXQ2 Compression
- `scxq2_encode` - Compress data
- `scxq2_decode` - Decompress data
- `scxq2_stats` - Compression statistics

#### Micronaut AI
- `micronaut_infer` - Text completion
- `micronaut_intent` - Intent classification
- `micronaut_complete` - Code completion
- `micronaut_chat` - Chat response
- `micronaut_train` - Trigger training
- `micronaut_status` - Micronaut status

## 📋 Examples

### Example 1: Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "ok": true,
  "server": "ASX XJSON Server",
  "version": "1.0.0",
  "handlers": 42,
  "uptime": 123.456
}
```

### Example 2: GHOST List Tapes

```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "ghost_list",
      "input": {}
    }
  }'
```

### Example 3: K'UHUL Routing

```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "kuhul_route",
      "input": {
        "shard": "llm_rombos_coder_qwen7b",
        "priority": 0.9
      }
    }
  }'
```

### Example 4: Multi-Judge Tribunal

```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "agents_tribunal",
      "input": {
        "task": "Review this code for security issues",
        "judges": ["cline", "rombos"],
        "timeout": 30000
      }
    }
  }'
```

### Example 5: Micronaut Inference

```bash
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{
    "program": {
      "type": "micronaut_infer",
      "input": {
        "prompt": "The function returns",
        "max_tokens": 50
      }
    }
  }'
```

## 🏗️ Handler Structure

Each handler module exports an object with handler functions:

```javascript
export default {
  handler_name: async ({ input }) => {
    // Process input
    return {
      success: true,
      result: "..."
    };
  }
};
```

Handlers are automatically loaded and registered in `index.js`.

## 🔧 Development

### Adding New Handlers

1. Create file in `/handlers/` (e.g., `myhandler.js`)
2. Export handler functions
3. Import in `index.js`:

```javascript
import myhandler from './handlers/myhandler.js';

const handlers = {
  ...core,
  ...myhandler  // Add here
};
```

### Testing Handlers

```bash
# Start server
npm start

# Test specific handler
curl -X POST http://localhost:3000/xjson/run \
  -H "Content-Type: application/json" \
  -d '{"program": {"type": "ping", "input": {}}}'
```

## 🌐 Integration with Browser Runtime

The browser runtime (`/micronaut/micronaut-kuhul-runtime.js`) automatically tries the XJSON Server:

```javascript
const BackendRouter = {
  backends: [
    { name: 'xjson-server', url: 'http://localhost:3000/xjson/run', priority: 10 },
    { name: 'xjson-server-alt', url: 'http://localhost:3001/xjson/run', priority: 9 },
    { name: 'browser-fallback', url: null, priority: 1 }
  ],

  async call(endpoint, payload) {
    // Try XJSON servers first, fall back to browser
  }
};
```

This ensures the system **always works** - even offline.

## 📦 Dependencies

Minimal dependencies for maximum portability:

- `node-fetch` - HTTP requests
- `fs-extra` - Enhanced filesystem operations

No heavy frameworks, no databases, no bloat.

## 🚢 Deployment

### Local Development

```bash
npm start
```

### Production (Node.js hosting)

```bash
# Heroku, Railway, Render, etc.
npm install
npm start
```

### NPX (Zero Install)

```bash
npx asx-server
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security

- **Filesystem sandbox**: All file operations restricted to project directory
- **No eval()**: Expression evaluation is sandboxed
- **CORS enabled**: Frontend can connect from any origin
- **No database**: Stateless by design

## 📊 Performance

- **Startup time**: <1s
- **Memory usage**: ~50-100MB
- **Handler latency**: <10ms (most operations)
- **Concurrent requests**: Supports Node.js async by default

## 🛣️ Roadmap

- [x] Core handlers
- [x] K'UHUL integration
- [x] Agent coordination
- [x] GHOST protocol
- [x] SCXQ2 compression
- [x] Micronaut AI
- [ ] WebSocket support
- [ ] Real Ollama integration
- [ ] Real n-gram models
- [ ] Persistent storage layer
- [ ] Clustering support

## 🤝 Integration Points

### With ASXR Multi-Hive

XJSON Server provides the backend for ASXR's virtual mesh networking.

### With K'UHUL Scheduler

Routes AI workloads to optimal devices (CPU/GPU/WebGPU).

### With GHOST Protocol

Auto-discovers and routes to tapes in `/tapes/` directory.

### With Micronaut AI

Provides server-side inference for n-gram models.

## 📜 License

MIT License - Part of ASX Tapes Arcade ecosystem

---

**Built with ⟁ by ASX Labs**

*No PHP required. Browser-only fallback included. Works everywhere.*
