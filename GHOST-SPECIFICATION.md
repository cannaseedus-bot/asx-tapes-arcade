# 👻 GHOST v1 SPECIFICATION

**Global Host Orchestration Specification for Tapes**

The canonical standard for how Tapes register, communicate, load, unload, execute, exchange data, expose APIs, and interoperate with external runtimes.

**GHOST = The Universal OS Contract for All Tapes**

---

## 🎯 Purpose

A GHOST-compliant host MUST:

1. **Discover** tapes
2. **Register** tapes in a central registry
3. **Expose** each tape's public UI and API
4. **Proxy** requests between tapes
5. **Route** jobs to correct agents (Swarm / KLH / KUHUL)
6. **Persist** logs, datasets, states
7. **Mount** external runtimes as tape extensions
8. **Provide** inter-tape communication
9. **Provide** universal authentication layer (optional)
10. **Be tape-agnostic** (website, game, AI, backend - identical structure)

GHOST is the **bridge** connecting all Tapes into one living OS.

---

## 📁 Directory Structure

A compliant GHOST host MUST contain:

```
/tapes/                  ← All tape modules
  <tape-a>/
    tape.json           ← Tape manifest (required)
    public/             ← UI files
      index.html        ← Entry point (required)
      app.js
      style.css
    route.php           ← API handler (required)
    agents/             ← Agent definitions
      agents.json
    brains/             ← Logic modules
    db/                 ← Database
      asx-db.json
    logs/               ← Session logs

  <tape-b>/
    ...

/host/                   ← Host system files
  ghost.json            ← Central registry (auto-generated)
  ghost-cache.json      ← Runtime state cache
  routes.php            ← Primary router for all tapes
  host-api.php          ← Host-level API
  swarm.json            ← Agent routing map
  settings.json         ← Host configuration
  logs/                 ← Host-level logs

/agents/                 ← Shared agent library (optional)
  cline-agent.json
  ollama-agent.json
  ...
```

---

## 📜 Tape Manifest (tape.json)

Every tape MUST include a `tape.json` file:

```json
{
  "id": "cline_v9",
  "name": "Cline DevOps v9",
  "version": "9.0.0",
  "description": "AI-powered DevOps automation tape",
  "author": "ASX Labs",

  "entry": "/tapes/cline_v9/public/index.html",

  "routes": {
    "api": "/tapes/cline_v9/route.php",
    "extras": ["/eval", "/train", "/ollama"]
  },

  "agents": "/tapes/cline_v9/agents/agents.json",

  "host": {
    "visibility": "public",
    "capabilities": ["ui", "api", "agents", "dataset"],
    "requires": ["php", "curl"],
    "permissions": {
      "filesystem": "read-write",
      "network": "localhost",
      "shell": true
    }
  },

  "metadata": {
    "category": "devops",
    "tags": ["ai", "automation", "cline"],
    "icon": "🤖",
    "screenshot": "/tapes/cline_v9/public/screenshot.png"
  }
}
```

### Required Fields:
- `id` - Unique tape identifier
- `name` - Display name
- `version` - Semantic version
- `entry` - Path to main UI file
- `routes.api` - Path to API handler

### Optional Fields:
- `description` - Tape description
- `author` - Creator name
- `agents` - Path to agents config
- `host.visibility` - `public`, `private`, `unlisted`
- `host.capabilities` - What the tape can do
- `host.requires` - Runtime requirements
- `metadata` - Display info for HOLO UI

---

## 🗂️ Host Registry (ghost.json)

Auto-generated at boot. Maps all tapes with runtime metadata:

```json
{
  "version": "1.0",
  "generated": "2025-01-19T12:00:00Z",

  "tapes": {
    "cline_v9": {
      "path": "/tapes/cline_v9/",
      "entry": "/tapes/cline_v9/public/index.html",
      "api": "/tapes/cline_v9/route.php",
      "agents": "/tapes/cline_v9/agents/agents.json",
      "mounted": true,
      "status": "online",
      "lastAccessed": "2025-01-19T11:58:30Z"
    },

    "space-invaders": {
      "path": "/tapes/space-invaders/",
      "entry": "/tapes/space-invaders/public/index.html",
      "api": "/tapes/space-invaders/route.php",
      "mounted": true,
      "status": "online",
      "lastAccessed": "2025-01-19T11:45:12Z"
    }
  },

  "host": {
    "root": "/host/",
    "swarm": "/host/swarm.json",
    "settings": "/host/settings.json",
    "agents": "/agents/"
  },

  "external": {
    "ollama": "http://localhost:11434/api/chat",
    "cline": "http://localhost:9999/run",
    "mx2lm": "http://localhost:9988/infer",
    "qwen": "http://localhost:5001/chat"
  }
}
```

---

## 🌐 GHOST API Endpoints

All GHOST hosts MUST implement these HTTP endpoints:

### 1. Tape Discovery

```
GET /ghost/tapes
```

Returns list of all registered tapes:

```json
[
  {
    "id": "cline_v9",
    "name": "Cline DevOps v9",
    "entry": "/tapes/cline_v9/public/index.html",
    "api": "/tapes/cline_v9/route.php",
    "status": "online"
  },
  ...
]
```

### 2. Tape Metadata

```
GET /ghost/tapes/:id
```

Returns full tape manifest:

```json
{
  "id": "cline_v9",
  "name": "Cline DevOps v9",
  "version": "9.0.0",
  ...
}
```

### 3. Tape Launch (UI)

```
GET /ghost/launch/:id
```

Redirects to tape's entry point:
```
→ /tapes/cline_v9/public/index.html
```

### 4. Tape API Proxy

```
POST /ghost/proxy/:id
```

Forwards request to tape's API handler:

**Request:**
```json
{
  "method": "execute",
  "payload": {
    "command": "git status"
  }
}
```

**Host forwards to:**
```
→ POST /tapes/cline_v9/route.php
```

**Response:**
```json
{
  "ok": true,
  "output": "On branch main\nnothing to commit"
}
```

### 5. External Runtime Proxy

```
POST /ghost/proxy/external/:service
```

Routes to external services defined in `ghost.json`:

**Request:**
```
POST /ghost/proxy/external/ollama
```

**Host routes to:**
```
→ POST http://localhost:11434/api/chat
```

### 6. Swarm Agent Routing

```
POST /ghost/swarm/route
```

Intelligently routes tasks to best agent:

**Request:**
```json
{
  "task": "code_review",
  "payload": {
    "file": "app.js",
    "content": "..."
  }
}
```

**Host:**
1. Checks `swarm.json` for agents with `code_review` skill
2. Routes to best match (e.g., Cline)
3. Returns result

### 7. Tape Mount/Unmount

```
POST /ghost/tapes/:id/mount
POST /ghost/tapes/:id/unmount
```

Controls tape availability:

**Mount:**
- Makes tape accessible
- Registers routes
- Initializes agents

**Unmount:**
- Blocks new requests
- Preserves state
- Logs unmount event

### 8. Tape Reload

```
POST /ghost/tapes/:id/reload
```

Hot-reloads a tape:
- Re-reads `tape.json`
- Refreshes routes
- Clears caches
- Doesn't drop state

---

## 🔄 Tape-to-Tape Communication

Any tape can call another tape through the proxy:

### From Tape A to Tape B:

```javascript
// In Tape A's code
async function callTapeB(method, data) {
  const response = await fetch('/ghost/proxy/tape-b', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: method,
      payload: data
    })
  });

  return await response.json();
}

// Use it
const result = await callTapeB('train', {
  dataset: 'my-data.jsonl',
  epochs: 10
});
```

### Tape B's Route Handler:

```php
<?php
// /tapes/tape-b/route.php

$input = json_decode(file_get_contents('php://input'), true);
$method = $input['method'] ?? 'default';
$payload = $input['payload'] ?? [];

switch ($method) {
  case 'train':
    $result = trainModel($payload);
    echo json_encode(['ok' => true, 'result' => $result]);
    break;

  default:
    echo json_encode(['error' => 'Unknown method']);
}
?>
```

This creates a **fractal network** where any tape can orchestrate any other tape.

---

## 🤖 Swarm Agent Routing

`swarm.json` defines the multi-agent routing system:

```json
{
  "version": "1.0",

  "agents": {
    "cline": {
      "type": "local-tape",
      "url": "/tapes/cline_v9/route.php",
      "skills": [
        "code_generation",
        "debugging",
        "refactoring",
        "git_operations"
      ],
      "priority": 10,
      "status": "online"
    },

    "ollama": {
      "type": "external",
      "url": "http://localhost:11434/api/chat",
      "skills": [
        "chat",
        "reasoning",
        "general"
      ],
      "priority": 5,
      "status": "online"
    },

    "mx2lm": {
      "type": "external",
      "url": "http://localhost:9988/infer",
      "skills": [
        "reasoning",
        "longform",
        "analysis"
      ],
      "priority": 8,
      "status": "online"
    }
  },

  "router": {
    "strategy": "skill_match_first",
    "fallback": "ollama",
    "timeout": 30000,
    "retry": 2
  }
}
```

### Routing Logic:

1. **Task arrives** at `/ghost/swarm/route`
2. **Host checks** task type/skills needed
3. **Matches** against agents in `swarm.json`
4. **Routes** to highest-priority matching agent
5. **Returns** result to caller

Example:
```
Task: "Review this code" → Cline (priority 10, has code_review)
Task: "Chat casually"    → Ollama (priority 5, has chat)
Task: "Analyze trends"   → MX2LM (priority 8, has analysis)
```

---

## 🔌 External Runtime Integration

GHOST hosts can proxy to external services:

### Ollama Integration:

```json
{
  "external": {
    "ollama": "http://localhost:11434/api/chat"
  }
}
```

Any tape can call Ollama:

```javascript
const response = await fetch('/ghost/proxy/external/ollama', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama2',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
```

### Cline Bot Integration:

```json
{
  "external": {
    "cline": "http://localhost:9999/run"
  }
}
```

### MX2LM Integration:

```json
{
  "external": {
    "mx2lm": "http://localhost:9988/infer"
  }
}
```

**All external services become accessible to all tapes through the GHOST proxy.**

---

## 📊 Tape Lifecycle

### 1. Boot

When host starts:
1. Scan `/tapes/` directory
2. Read each `tape.json`
3. Validate manifests
4. Generate `ghost.json` registry
5. Initialize routes
6. Mount default tapes
7. Start external connections

### 2. Mount

When tape is mounted:
1. Mark `mounted: true` in registry
2. Register API routes
3. Initialize agents (if any)
4. Load brains (if any)
5. Warm caches
6. Log mount event

### 3. Unmount

When tape is unmounted:
1. Mark `mounted: false`
2. Block new requests
3. Complete pending requests
4. Save state
5. Log unmount event

### 4. Reload

When tape is reloaded:
1. Re-read `tape.json`
2. Update registry
3. Refresh routes
4. Clear caches
5. Preserve state
6. Log reload event

---

## ✅ Tape Requirements

All tapes MUST include:

### Required Files:
- `tape.json` - Manifest
- `public/index.html` - UI entry point
- `route.php` or `route.js` - API handler

### Required API Methods:
- `default` - Default handler
- `status` - Health check

### Optional But Recommended:
- `agents/agents.json` - Agent definitions
- `brains/` - Logic modules
- `db/asx-db.json` - Database
- `logs/` - Session logs
- `README.md` - Documentation

### API Contract:

Every tape's route handler MUST accept:

```json
{
  "method": "string",
  "payload": {}
}
```

And return:

```json
{
  "ok": boolean,
  "result": any,
  "error": "string (if ok: false)"
}
```

---

## 🎨 HOLO UI Standard

All tapes SHOULD use the HOLO UI standard for consistency:

### Visual Language:
- Green phosphor CRT aesthetic
- Scanline effects
- Monospace fonts
- Card-based layouts
- Consistent spacing

### CSS Framework:

```css
/* All tapes inherit */
@import url('/host/holo-ui.css');

:root {
  --holo-bg: #0a0a0a;
  --holo-fg: #00ff88;
  --holo-accent: #00ffe1;
  --holo-danger: #ff0066;
  --holo-warning: #ffaa00;
  --holo-glow: 0 0 10px rgba(0, 255, 136, 0.5);
}
```

### Component Library:

- `.holo-card` - Content cards
- `.holo-grid` - Grid layouts
- `.holo-btn` - Buttons
- `.holo-input` - Form inputs
- `.holo-scanlines` - CRT effect
- `.holo-glow` - Neon glow

---

## 🔒 Security & Permissions

### Tape Sandboxing:

Tapes declare permissions in `tape.json`:

```json
{
  "host": {
    "permissions": {
      "filesystem": "read-only",
      "network": "localhost",
      "shell": false,
      "dangerous_cmds": false
    }
  }
}
```

Host MUST enforce these restrictions.

### Authentication:

Optional but recommended:

```json
{
  "auth": {
    "enabled": true,
    "provider": "google-oauth",
    "required_for": ["admin", "devops"]
  }
}
```

---

## 📈 Monitoring & Logging

### Host-Level Logs:

```
/host/logs/
  boot-2025-01-19.log
  access-2025-01-19.log
  errors-2025-01-19.log
```

### Tape-Level Logs:

```
/tapes/cline_v9/logs/
  session-2025-01-19-12-00-00.json
  errors-2025-01-19.log
```

### Metrics:

GHOST hosts SHOULD expose:

```
GET /ghost/metrics
```

```json
{
  "tapes_mounted": 12,
  "tapes_active": 3,
  "requests_total": 45230,
  "requests_per_minute": 125,
  "uptime_seconds": 86400
}
```

---

## 🚀 Implementation Example

See `asx-tapes-arcade` for reference implementation:

```
/arcade/index.html    → GHOST host UI
/arcade/app.js        → Host logic
/tapes/*              → Tape library
/studio/*             → Studio system (also a tape!)
```

**Zero React. Zero Vite. Pure GHOST.**

---

## 🎯 Compliance Checklist

A GHOST-compliant host MUST:

- ✅ Scan `/tapes/` and generate `ghost.json`
- ✅ Expose `/ghost/tapes` API
- ✅ Implement tape proxy (`/ghost/proxy/:id`)
- ✅ Support tape mounting/unmounting
- ✅ Provide external runtime proxy
- ✅ Enable tape-to-tape communication

SHOULD:

- ✅ Implement swarm routing
- ✅ Use HOLO UI standard
- ✅ Enforce permissions
- ✅ Log all operations
- ✅ Support hot reload

MAY:

- ✅ Add authentication
- ✅ Implement caching
- ✅ Add monitoring dashboard
- ✅ Support WebSocket streams

---

## 🌐 Future Extensions

### GHOST v2 Proposals:
- WebSocket support for real-time streams
- Distributed tape hosting (P2P)
- Tape marketplace integration
- GPU/TPU resource pooling
- Cross-host tape federation
- Blockchain-based tape registry

---

**GHOST v1.0 - The Universal Tape Host Standard**

*Built with ⟁ by ASX Labs*
