# 🔥 ASX TAPES ARCADE - COMPLETE BACKEND-AGNOSTIC SYSTEM

**No PHP Required | Browser-Only Fallback | Zero Build Step**

This document describes the complete backend-agnostic architecture that makes ASX Tapes Arcade work **everywhere** - with or without any backend server.

---

## 🎯 Core Architecture

### The Three-Tier Fallback Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER CLIENT                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            KHL Unified Runtime                       │  │
│  │  (runtime/khl-unified.js)                           │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│                      ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Backend Router (Auto-Detect)                 │  │
│  └───┬────────────┬────────────┬────────────────────────┘  │
│      │            │            │                            │
└──────┼────────────┼────────────┼────────────────────────────┘
       │            │            │
       │ Try #1     │ Try #2     │ Always Works
       ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│  XJSON   │  │  XJSON   │  │   Browser    │
│  Server  │  │ Server   │  │   Fallback   │
│  :3000   │  │  :3001   │  │  (IndexedDB) │
└──────────┘  └──────────┘  └──────────────┘
 PRIMARY      SECONDARY      GUARANTEED
```

### Key Principle: **Always Works**

No matter what happens - no server, no backend, no internet - the system **always works** because it falls back to browser-only mode using IndexedDB, localStorage, and WebGPU.

---

## 📦 System Components

### 1. KHL Unified Runtime (`/runtime/khl-unified.js`)

The main orchestrator that:
- Auto-detects available backends
- Routes calls intelligently
- Falls back gracefully
- Manages tapes, agents, and state

**Usage:**
```javascript
const khl = new KHL({ debug: true });
await khl.init();

// All methods work regardless of backend availability
const info = await khl.info();
const tapes = await khl.discoverTapes();
const session = await khl.launchTape('my_tape');
```

### 2. XJSON Server (`/xjson-server/`)

**THE PRIMARY BACKEND** - Node.js server with 42 handlers:

```bash
# Start server
cd xjson-server
npm install
npm start

# Or use npx
npx asx-server
```

**Handlers:**
- **Core**: ping, info, echo, store, log
- **K'UHUL**: device routing, scheduling, glyph execution
- **Agents**: multi-agent coordination, tribunal, swarm
- **Filesystem**: read, write, list, JSON operations
- **GHOST**: tape discovery, launch, routing
- **SCXQ2**: compression/decompression
- **Micronaut**: AI inference, chat, code completion

### 3. Browser Fallback (`/micronaut/browser-fallback.js`)

Complete offline implementation using:
- **IndexedDB** for persistent storage
- **localStorage** for quick access
- **WebGPU** for AI inference (when available)
- **ServiceWorker** for caching (future)

**Features:**
- All core operations work offline
- File system emulation
- Simple AI responses
- Compression codec
- State persistence

### 4. Micronaut × K'UHUL Runtime (`/micronaut/micronaut-kuhul-runtime.js`)

Advanced runtime with:
- SystemProfiler (device detection)
- SCXQ2 codec
- FRACTAL-OS glyph loader
- XCFE control flow engine
- Multi-backend router
- K'UHUL scheduler
- Micronaut AI system

---

## 🚀 Quick Start

### Option 1: With XJSON Server (Recommended)

```bash
# Terminal 1: Start XJSON Server
cd xjson-server
npm install
npm start

# Terminal 2: Serve frontend (any HTTP server)
cd public
python -m http.server 8080
# or
npx http-server -p 8080

# Open browser
open http://localhost:8080
```

### Option 2: Browser-Only (No Backend)

```bash
# Just serve the frontend
cd public
python -m http.server 8080

# Open browser
open http://localhost:8080
```

The system will automatically detect no backend is available and switch to browser-only mode. **Everything still works.**

---

## 🎮 Demo & Testing

Open `public/index.html` in your browser to access the interactive demo with:

### Basic Operations
- Ping server
- Get system info
- Discover tapes
- Check status

### Storage Operations
- Store/retrieve data
- List keys
- Write/read files (virtual filesystem)

### AI & Agent Operations
- Micronaut inference
- Multi-judge tribunal
- List agents
- K'UHUL routing

### Compression
- Compress data with SCXQ2
- Decompress data
- View compression statistics

---

## 🔧 Architecture Details

### Backend Detection Flow

```javascript
// KHL automatically tries backends in priority order
1. Try XJSON Server (localhost:3000) → Priority 10
2. Try XJSON Server Alt (localhost:3001) → Priority 9
3. Fall back to Browser-Only → Priority 1 (always works)
```

### Call Routing

```javascript
// Single call() method routes to best available backend
await khl.call('ping', {});

// If XJSON Server available:
//   → HTTP POST to http://localhost:3000/xjson/run

// If XJSON Server unavailable:
//   → Falls back to window.BrowserFallback.call()
```

### State Management

```javascript
// Browser-only mode uses IndexedDB
const storage = window.BrowserFallback.storage;
await storage.set('tapes', { id: 'tape1', data: {...} });
const tape = await storage.get('tapes', 'tape1');

// Same API whether using server or browser-only
```

---

## 📊 Feature Matrix

| Feature | XJSON Server | Browser-Only | Notes |
|---------|--------------|--------------|-------|
| **Core Operations** | ✅ Full | ✅ Full | Ping, info, echo, store |
| **File System** | ✅ Real FS | ✅ IndexedDB | Browser uses virtual FS |
| **GHOST Protocol** | ✅ Full | ✅ Basic | Tape discovery works both |
| **K'UHUL Routing** | ✅ Full | ✅ Mock | Server has real device profiles |
| **Multi-Judge** | ✅ Full | ✅ Mock | Server calls real AI models |
| **Micronaut AI** | ✅ Full | ✅ Simple | Server has n-gram models |
| **SCXQ2** | ✅ Full | ✅ Full | Compression works identically |
| **Storage** | ✅ RAM | ✅ IndexedDB | Browser storage persists |
| **Offline Mode** | ❌ No | ✅ Yes | Browser-only works offline |

---

## 🎓 Usage Examples

### Example 1: Initialize and Check Status

```javascript
// Create KHL instance
const khl = new KHL({ debug: true });
await khl.init();

// Check what backend is active
const status = khl.getStatus();
console.log('Mode:', status.mode); // 'server' or 'browser'
console.log('Backend:', status.backend); // 'xjson-server' or 'browser-fallback'
```

### Example 2: Discover and Launch Tapes

```javascript
// Discover all available tapes
const tapes = await khl.discoverTapes();
console.log(`Found ${tapes.size} tapes`);

// Launch a specific tape
const session = await khl.launchTape('cline_tape_v1', {
  user: 'developer',
  mode: 'debug'
});

console.log('Session ID:', session.id);
```

### Example 3: Multi-Judge Tribunal

```javascript
// Evaluate code with multiple judges
const result = await khl.tribunal(
  'Review this code for security issues',
  ['cline', 'rombos'],
  30000 // 30 second timeout
);

console.log('Verdict:', result.final_verdict);
console.log('Consensus:', result.consensus);
console.log('Votes:', result.votes);
```

### Example 4: Storage Operations

```javascript
// Store data (works in both modes)
await khl.store('set', 'user_prefs', {
  theme: 'dark',
  language: 'en',
  notifications: true
});

// Retrieve data
const prefs = await khl.store('get', 'user_prefs');
console.log('Theme:', prefs.value.theme);

// List all keys
const keys = await khl.store('list');
console.log('Stored keys:', keys.keys);
```

### Example 5: AI Inference

```javascript
// Micronaut text completion
const result = await khl.infer('The function returns', {
  max_tokens: 50,
  temperature: 0.7
});

console.log('Completion:', result.completion);
```

### Example 6: File Operations

```javascript
// Write virtual file
await khl.writeFile('/data/config.json', JSON.stringify({
  version: '1.0.0',
  settings: { debug: true }
}, null, 2));

// Read file back
const file = await khl.readFile('/data/config.json');
console.log('Content:', file.content);
```

### Example 7: Compression

```javascript
// Compress large data
const data = {
  users: [...],  // large array
  metadata: {...}
};

const compressed = await khl.compress(data);
console.log('Original:', compressed.original_size, 'bytes');
console.log('Compressed:', compressed.compressed_size, 'bytes');
console.log('Savings:', compressed.ratio);

// Decompress
const original = await khl.decompress(compressed.compressed);
```

---

## 🔐 Security

### Filesystem Sandbox

```javascript
// All file operations are sandboxed to project directory
// Attempts to access outside paths are rejected
await khl.writeFile('../../etc/passwd', 'hack'); // ❌ Rejected
```

### No eval()

```javascript
// Expression evaluation is sandboxed (no arbitrary code)
// Only safe operations allowed
```

### CORS Enabled

```javascript
// Server allows cross-origin requests for development
// Configure appropriately for production
```

---

## 🚢 Deployment

### Development

```bash
# Start XJSON Server
cd xjson-server && npm start

# Serve frontend
cd public && npx http-server
```

### Production (Node.js Host)

```bash
# Deploy XJSON Server to Heroku, Railway, Render, etc.
cd xjson-server
npm install
npm start
```

### Static Hosting (GitHub Pages, Netlify)

```bash
# Just deploy /public/ folder
# System works in browser-only mode
# No server required!
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY xjson-server/package*.json ./
RUN npm install
COPY xjson-server/ ./
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🎯 Why Backend-Agnostic?

### 1. **Works Everywhere**
Deploy to any environment - from free static hosting to enterprise servers.

### 2. **Progressive Enhancement**
Start with browser-only, add server when needed for performance.

### 3. **Offline-First**
Users can work offline and sync later.

### 4. **No Vendor Lock-In**
Not tied to specific backend technology (PHP, Python, Node.js).

### 5. **Educational**
Perfect for teaching distributed systems without infrastructure complexity.

---

## 🛣️ What's Next?

### Phase 1: Core Features (✅ COMPLETED)
- [x] Backend-agnostic runtime
- [x] XJSON Server with 42 handlers
- [x] Browser fallback system
- [x] KHL unified runtime
- [x] Interactive demo page

### Phase 2: Micronaut AI (🔄 IN PROGRESS)
- [ ] Train n-gram models (trigrams, bigrams)
- [ ] Implement intent classifier
- [ ] Build code completion
- [ ] Create chat responses

### Phase 3: Advanced Features (📋 PLANNED)
- [ ] WebSocket support
- [ ] Real Ollama integration
- [ ] ServiceWorker caching
- [ ] Tape hot-reloading
- [ ] Visual block editor

### Phase 4: Performance (📋 PLANNED)
- [ ] WebGPU AI inference
- [ ] Compressed tape formats
- [ ] Lazy loading
- [ ] Code splitting

---

## 📚 Documentation

- `/xjson-server/README.md` - XJSON Server documentation
- `/MICRONAUT-ASXR-MASTER-SPEC.md` - Micronaut AI specification
- `/COMPLETE-SYSTEM-INTEGRATION.md` - Integration architecture
- `/public/index.html` - Interactive demo and examples

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test with both XJSON Server and browser-only modes
4. Submit pull request

---

## 📜 License

MIT License - Part of ASX Tapes Arcade ecosystem

---

**Built with ⟁ by ASX Labs**

*No PHP required. No build step. Works everywhere.*
