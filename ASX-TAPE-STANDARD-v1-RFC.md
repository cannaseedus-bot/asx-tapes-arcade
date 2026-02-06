# ASX TAPE STANDARD v1.0 - RFC

**Request for Comments**

**Status:** Proposed Standard
**Date:** January 2025
**Author:** ASX Labs

---

## Abstract

This document defines the ASX Tape Standard - a universal format for self-contained software modules. A Tape is a directory structure that contains everything needed to run an application: UI, logic, data, agents, and API. The standard enables Git repositories to become instantly deployable software capsules.

---

## 1. Introduction

### 1.1 Motivation

Modern web development suffers from:
- Dependency hell (node_modules)
- Build tool churn (Webpack → Vite → Turbopack)
- Framework fragmentation (React → Next → Remix)
- Version conflicts
- Deployment complexity

**The ASX Tape Standard solves this by defining a self-contained software capsule format.**

### 1.2 Core Principle

> **"If it has a folder, it can be a Tape."**

Any directory can become a Tape by adding a `tape.json` manifest.

### 1.3 Key Insight

> **"A Git repository IS a Tape."**

This transforms:
- GitHub → Tape Marketplace
- Git clone → Tape install
- Git repo → Deployable software

---

## 2. Terminology

**Tape** - A self-contained software module with standardized structure

**GHOST** - Global Host Orchestration Specification for Tapes (the protocol)

**Host** - Any system that can load and run Tapes

**HOLO** - The standard UI/UX language for Tape browsers

**Agent** - An AI or automation service within a Tape

**Brain** - Logic, configuration, or AI model data in a Tape

---

## 3. Tape Structure

### 3.1 Required Files

Every Tape MUST contain:

```
/tape.json           # Manifest (required)
/public/
  index.html         # UI entry point (required)
```

### 3.2 Recommended Structure

```
/tapes/<tape-id>/
  tape.json          # Manifest

  /public/           # UI files
    index.html       # Entry point
    app.js           # Application logic
    style.css        # Styling

  /agents/           # AI agents (optional)
    agents.json      # Agent definitions

  /brains/           # Logic modules (optional)
    config.json      # Configuration
    intent-map.json  # Intent routing

  /db/               # Database (optional)
    asx-db.json      # Local database

  /logs/             # Logs (optional)
    session-*.json   # Session logs

  route.php          # API handler (optional)
  README.md          # Documentation (optional)
```

### 3.3 Optional Directories

- `/dataset/` - Training data for AI
- `/runtime/` - Runtime binaries (GPU/TPU kernels)
- `/assets/` - Media files
- `/patches/` - Auto-fix patches
- `/models/` - AI model weights

---

## 4. tape.json Specification

### 4.1 Minimal Example

```json
{
  "id": "my-tape",
  "name": "My Tape",
  "version": "1.0.0",
  "entry": "/tapes/my-tape/public/index.html"
}
```

### 4.2 Complete Example

```json
{
  "id": "cline-devops",
  "name": "Cline DevOps",
  "version": "9.0.0",
  "description": "AI-powered DevOps automation",
  "author": "ASX Labs",

  "entry": "/tapes/cline-devops/public/index.html",

  "routes": {
    "api": "/tapes/cline-devops/route.php",
    "extras": ["/eval", "/train"]
  },

  "agents": "/tapes/cline-devops/agents/agents.json",

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
    "screenshot": "/tapes/cline-devops/screenshot.png"
  }
}
```

### 4.3 Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (kebab-case) |
| `name` | string | Display name |
| `version` | string | Semantic version (x.y.z) |
| `entry` | string | Path to UI entry point |

### 4.4 Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Brief description |
| `author` | string | Creator name |
| `routes.api` | string | Path to API handler |
| `agents` | string | Path to agents config |
| `host` | object | Host requirements |
| `metadata` | object | Display metadata |

---

## 5. The "Git is a Tape" Model

### 5.1 Conversion Process

Any Git repository can become a Tape:

```bash
# 1. Clone repo
git clone https://github.com/user/my-app

# 2. Add tape.json
echo '{
  "id": "my-app",
  "name": "My App",
  "version": "1.0.0",
  "entry": "/tapes/my-app/public/index.html"
}' > my-app/tape.json

# 3. Move to tapes directory
mv my-app /tapes/

# 4. Done! Tape is ready
```

### 5.2 GitHub as Tape Marketplace

GitHub repositories with `tape.json` become instantly:
- Discoverable
- Deployable
- Loadable
- Shareable

### 5.3 Benefits

✅ **Zero build step** - Just clone and load
✅ **No dependencies** - Self-contained
✅ **Instant deploy** - Drop into /tapes/
✅ **Version control** - Git built-in
✅ **Portable** - Works anywhere
✅ **Composable** - Tapes load tapes

---

## 6. GHOST Protocol

### 6.1 Host Discovery

Hosts MUST scan `/tapes/*/tape.json` and register discovered Tapes.

### 6.2 Endpoints

Compliant hosts MUST implement:

```
GET  /ghost/tapes              # List all tapes
GET  /ghost/tapes/:id          # Get tape info
POST /ghost/proxy/:id          # Proxy to tape API
POST /ghost/proxy-external/:s  # Proxy to external service
POST /ghost/swarm/route        # Route to best agent
```

### 6.3 Auto-Generated Registry

Hosts MUST generate `ghost.json` on discovery:

```json
{
  "version": "1.0",
  "generated": "2025-01-19T12:00:00Z",
  "tapes": {
    "my-tape": {
      "id": "my-tape",
      "name": "My Tape",
      "path": "/tapes/my-tape/",
      "entry": "/tapes/my-tape/public/index.html",
      "status": "online"
    }
  }
}
```

---

## 7. Fractal Composition

### 7.1 Principle

> **Any Tape can load any other Tape.**

This enables infinite nesting:

```
┌─────────────────────────────┐
│  Operating System Tape      │
│  ┌───────────────────────┐  │
│  │  Studio Tape          │  │
│  │  ┌─────────────────┐  │  │
│  │  │  Game Tape      │  │  │
│  │  │  ┌───────────┐  │  │  │
│  │  │  │ AI Agent  │  │  │  │
│  │  │  └───────────┘  │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### 7.2 Communication

Tapes communicate via GHOST proxy:

```javascript
// Tape A calls Tape B
const response = await fetch('/ghost/proxy/tape-b', {
  method: 'POST',
  body: JSON.stringify({
    path: '/api/action',
    payload: { data: 'value' }
  })
});
```

---

## 8. HOLO UI Standard

### 8.1 Visual Language

All Tapes SHOULD use the HOLO aesthetic:
- Green phosphor CRT style
- Scanline effects
- Monospace typography
- Card-based layouts
- Status indicators

### 8.2 Tape Card

Standard display format:

```
┌──────────────────────────────┐
│  [ICON]                      │
│  TAPE NAME                   │
│  by Author · v1.0            │
│                              │
│  3 frames · 12 loads         │
│                              │
│  #tag #tag #tag              │
│                              │
│  [LOAD BUTTON]               │
└──────────────────────────────┘
```

---

## 9. Agent System

### 9.1 agents.json Format

```json
{
  "cline": {
    "id": "cline",
    "type": "ai-agent",
    "skills": ["code", "debug", "ops"],
    "url": "http://localhost:9999/run",
    "status": "online"
  }
}
```

### 9.2 Swarm Routing

Hosts route tasks to appropriate agents based on skills.

---

## 10. Security

### 10.1 Permissions

Tapes declare required permissions in `tape.json`:

```json
{
  "host": {
    "permissions": {
      "filesystem": "read-only",
      "network": "localhost",
      "shell": false
    }
  }
}
```

### 10.2 Sandboxing

Hosts SHOULD sandbox Tapes:
- Separate processes
- Limited file access
- Network restrictions
- Resource limits

---

## 11. Versioning

### 11.1 Semantic Versioning

Tapes MUST use semantic versioning: `MAJOR.MINOR.PATCH`

### 11.2 Compatibility

Hosts SHOULD support multiple versions of the same Tape.

---

## 12. Migration from Traditional Apps

### 12.1 React/Vite Apps

```bash
# 1. Create tape.json
# 2. Move build output to /public/
# 3. Add route.php for API
# 4. Done!
```

### 12.2 Electron Apps

```bash
# 1. Extract web assets to /public/
# 2. Convert main.js to route.php
# 3. Add tape.json
# 4. Run in browser instead of Electron
```

### 12.3 VS Code Extensions

```bash
# 1. Convert extension to web app
# 2. Add tape.json
# 3. Load as Tape in ASX-HOLO
```

---

## 13. Compliance

### 13.1 Tape Compliance

A compliant Tape MUST:
- ✅ Have `tape.json` with required fields
- ✅ Have `/public/index.html` entry point
- ✅ Use semantic versioning
- ✅ Declare permissions

### 13.2 Host Compliance

A compliant Host MUST:
- ✅ Implement GHOST endpoints
- ✅ Auto-generate `ghost.json`
- ✅ Support tape-to-tape proxy
- ✅ Enforce permissions

---

## 14. Future Extensions

### 14.1 Proposed Features

- WebSocket streaming
- P2P tape distribution
- Blockchain tape registry
- GPU/TPU resource pooling
- Cross-host federation

---

## 15. References

- GHOST Specification v1.0
- HOLO UI Standard v1.0
- ASX Ecosystem Documentation

---

## 16. Conclusion

The ASX Tape Standard establishes:

✅ **Universal software capsule format**
✅ **Git repositories as deployable apps**
✅ **Zero-build, zero-dependency paradigm**
✅ **Fractal composition model**
✅ **Standards-based, eternal compatibility**

**This is the post-framework future.**

---

**Status:** Proposed Standard
**Next Steps:** Public comment period, implementation feedback

**Built with ⟁ by ASX Labs**

---

## Appendix A: Complete tape.json Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "version", "entry"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$"
    },
    "name": {
      "type": "string"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "entry": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "author": {
      "type": "string"
    },
    "routes": {
      "type": "object",
      "properties": {
        "api": { "type": "string" },
        "extras": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "agents": {
      "type": "string"
    },
    "host": {
      "type": "object"
    },
    "metadata": {
      "type": "object"
    }
  }
}
```
