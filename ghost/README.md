# 👻 GHOST v1.0 Implementation

**Global Host Orchestration Specification for Tapes**

This is the official PHP implementation of the GHOST protocol.

---

## Quick Start

### 1. Installation

Place the `/ghost` folder at the root of your web server:

```
/public_html/
  /ghost/          ← This directory
  /tapes/          ← Your tapes
  /arcade/         ← ASX-HOLO UI (optional)
```

### 2. Requirements

- PHP 7.4+ with cURL extension
- Apache with mod_rewrite (or equivalent)
- Write permissions for `ghost.json` generation

### 3. Configuration

Edit `settings.json` to configure external services:

```json
{
  "external": {
    "ollama": "http://127.0.0.1:11434/api/chat",
    "mx2lm": "http://127.0.0.1:9988/infer",
    "qwen": "http://127.0.0.1:5001/chat",
    "cline": "http://127.0.0.1:9999/run"
  }
}
```

Edit `swarm.json` to configure agent routing:

```json
{
  "agents": {
    "cline": {
      "url": "http://127.0.0.1:9999/run",
      "skills": ["build", "deploy", "ops"]
    }
  }
}
```

---

## API Endpoints

### GET /ghost

System info and endpoint list.

```bash
curl http://localhost/ghost
```

**Response:**
```json
{
  "ghost": "v1.0",
  "status": "online",
  "endpoints": { ... }
}
```

### GET /ghost/tapes

List all tapes.

```bash
curl http://localhost/ghost/tapes
```

**Response:**
```json
[
  {
    "id": "space-invaders",
    "name": "Space Invaders",
    "version": "1.0.0",
    "entry": "/tapes/space-invaders/public/index.html",
    "api": "/tapes/space-invaders/route.php",
    "status": "online"
  }
]
```

### GET /ghost/tapes/:id

Get single tape info.

```bash
curl http://localhost/ghost/tapes/space-invaders
```

### POST /ghost/proxy/:id

Proxy request to tape API.

```bash
curl -X POST http://localhost/ghost/proxy/space-invaders \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/api/start",
    "method": "POST",
    "payload": { "level": 1 }
  }'
```

**Response:**
```json
{
  "ok": true,
  "tape": "space-invaders",
  "status": 200,
  "data": { ... }
}
```

### POST /ghost/proxy-external/:service

Proxy to external service.

```bash
curl -X POST http://localhost/ghost/proxy-external/ollama \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama2",
    "messages": [
      { "role": "user", "content": "Hello!" }
    ]
  }'
```

### POST /ghost/swarm/route

Route task to best agent.

```bash
curl -X POST http://localhost/ghost/swarm/route \
  -H "Content-Type: application/json" \
  -d '{
    "task": "build_and_deploy",
    "payload": { "repo": "my-app" }
  }'
```

**Response:**
```json
{
  "ok": true,
  "agent": "cline",
  "task": "build_and_deploy",
  "status": 200,
  "data": { ... }
}
```

---

## Tape Structure

For GHOST to discover a tape, it must have this structure:

```
/tapes/my-tape/
  tape.json           ← Required manifest
  public/
    index.html        ← UI entry point
  route.php           ← API handler (optional)
```

**Minimal tape.json:**

```json
{
  "id": "my-tape",
  "name": "My Tape",
  "version": "1.0.0",
  "entry": "/tapes/my-tape/public/index.html",
  "routes": {
    "api": "/tapes/my-tape/route.php"
  }
}
```

---

## Auto-Generated Files

### ghost.json

Generated on each `/ghost/tapes` request.

Contains complete registry of all discovered tapes.

```json
{
  "version": "1.0",
  "generated": "2025-01-19T12:00:00+00:00",
  "tapes": {
    "my-tape": { ... }
  },
  "host": {
    "root": "/path/to/ghost",
    "swarm": "/path/to/swarm.json",
    "settings": "/path/to/settings.json"
  }
}
```

---

## Integration with ASX-HOLO

The ASX-HOLO Plugin Template can use GHOST to discover and load tapes:

```javascript
// Fetch all tapes
const response = await fetch('/ghost/tapes');
const tapes = await response.json();

// Display in HOLO grid
tapes.forEach(tape => {
  renderTapeCard(tape);
});

// Load a tape
function loadTape(tapeId) {
  const tape = tapes.find(t => t.id === tapeId);
  window.location.href = tape.entry;
}
```

---

## Swarm Routing

GHOST uses simple keyword matching to route tasks:

- **build**, **deploy**, **ops**, **git** → Cline
- **eval**, **judge**, **grade**, **code** → Qwen
- **reason**, **analyze**, **longform** → MX2LM
- Everything else → Fallback (MX2LM)

You can customize this in `swarm.json`.

---

## Security

- CORS enabled by default (can be disabled in settings.json)
- No authentication (add your own if needed)
- Tape sandboxing recommended (separate directories)
- External service URLs should be localhost or trusted

---

## Troubleshooting

### Tapes not showing up

1. Check tape.json exists and is valid JSON
2. Check file permissions
3. Check PHP error log
4. Visit `/ghost/tapes` directly to see errors

### External services failing

1. Check service is running
2. Check URL in settings.json
3. Check network/firewall
4. Check service logs

### 500 errors

1. Check PHP error log
2. Check mod_rewrite is enabled
3. Check .htaccess is working
4. Check cURL extension is installed

---

## License

MIT - Part of the ASX ecosystem

**Built with ⟁ by ASX Labs**
