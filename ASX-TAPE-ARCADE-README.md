# 🎞️ ASX TAPE ARCADE

**The Ultimate Retro-Futuristic Game Engine and Multi-Hive OS**

Built with **K'uhul**, **SCX**, **XJSON**, **KLH**, and **Flash-RAM** technologies.

---

## 🧠 **What is ASX TAPE ARCADE?**

ASX TAPE ARCADE is a revolutionary arcade game system and multi-hive operating environment that combines:

- **K'uhul**: Stack-based programming language with Mayan-inspired syntax
- **SCX (Symbolic Cipher eXchange)**: Compression cipher for K'uhul code
- **XJSON**: Extended JSON with control flow and logic blocks
- **KLH (K'uhul Logic Hive)**: Multi-shard orchestration system
- **Tape System**: Self-contained micro-OS modules (like ROM cartridges)
- **Flash-RAM**: Instant-load AI brains and state management

### ✨ Key Features

✔️ **Multi-Hive Architecture**: Run unlimited independent shards
✔️ **Tape-Based Apps**: Self-contained game cartridges
✔️ **SCX Compression**: Efficient code storage and transmission
✔️ **K'uhul Scripting**: Powerful stack-based game logic
✔️ **XJSON Control Flow**: Dynamic, programmable JSON
✔️ **Cyberdeck UI**: Retro-futuristic terminal aesthetic
✔️ **Local-First**: No cloud, no bloat, pure speed

---

## 🚀 **Quick Start**

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/free-games.git
cd free-games
```

2. Open the arcade in your browser:
```bash
open arcade/index.html
```

Or use a local server:
```bash
python3 -m http.server 8000
# Then visit http://localhost:8000/arcade/
```

### First Steps

1. **Dashboard**: View system status and hive network
2. **Tape Library**: Browse and load game tapes
3. **Hive Matrix**: Manage your multi-hive server
4. **SCX Cipher**: Encode/decode K'uhul code
5. **K'uhul Console**: Run interactive K'uhul programs
6. **Arcade Games**: Play built-in games

---

## 📚 **Core Technologies**

### 🔷 K'uhul Language

K'uhul is a stack-based programming language with simple, elegant syntax:

```kuhul
[Pop main]
  [Wo 10]→[Ch'en hp]
  [Yax hp]→[Wo 5]→[Sek sub]→[Ch'en hp]
  [Yax hp]→[Wo 0]→[Sek gt]→[Ch'en alive]
[Xul]
```

**Operations:**
- `Pop`: Start function
- `Wo`: Push literal value
- `Ch'en`: Store variable
- `Yax`: Load variable
- `Sek`: Execute operation (add, sub, mul, div, gt, lt, eq, etc.)
- `Xul`: End function

### 🔷 SCX Cipher

SCX compresses K'uhul code using symbolic glyphs:

```
K'uhul: [Wo 10]→[Ch'en hp]
SCX:    ⟁Wo⟁10⟁Ch'en⟁hp⟁
```

**Benefits:**
- 40-60% compression ratio
- Fast encoding/decoding
- Preserves program structure
- Network-efficient transmission

### 🔷 XJSON Runtime

Extended JSON with control flow:

```json
{
  "@if": {"op": "gt", "left": "${hp}", "right": 0},
  "@then": {"type": "logic", "lang": "kuhul", "code": "[Wo true]→[Ch'en alive]"},
  "@else": {"type": "logic", "lang": "kuhul", "code": "[Wo false]→[Ch'en alive]"}
}
```

**Features:**
- `@if`, `@then`, `@else`: Conditionals
- `@while`, `@for`: Loops
- `${var}`: Variable substitution
- K'uhul integration

### 🔷 Tape System

Tapes are self-contained micro-OS modules:

```
tapes/<name>/
  tape.json       # Metadata & config
  brains/         # AI logic
  agents/         # Micro-agents
  db/             # Local database
  logs/           # Session logs
  public/         # UI assets
  route.js        # Backend routes
```

**A Tape Contains:**
- ✅ Its own UI
- ✅ Its own database
- ✅ Its own agents
- ✅ Its own AI brains
- ✅ Its own routes
- ✅ Self-booting logic

### 🔷 KLH Orchestrator

Multi-hive server coordination:

```javascript
// Register hive
klh.registerHive('dashboard', { name: 'Dashboard', port: 3001 });
klh.startHive('dashboard');

// Mount tape to hive
klh.mountTape('space-invaders-tape', 'games');

// Inter-hive communication
klh.sendToHive('dashboard', 'games', { action: 'launch', game: 'asteroids' });
```

---

## 🎮 **Creating Your First Game Tape**

### 1. Create Tape Configuration

Create `tapes/my-game/tape.json`:

```json
{
  "id": "my-game-tape",
  "name": "My Awesome Game",
  "version": "1.0.0",
  "description": "An awesome arcade game",
  "author": "Your Name",

  "brains": [
    {
      "id": "game-ai",
      "type": "game-ai",
      "logic": {
        "type": "logic",
        "lang": "kuhul",
        "code": [
          "[Pop update]",
          "  [Yax score]→[Wo 10]→[Sek add]→[Ch'en score]",
          "[Xul]"
        ]
      }
    }
  ],

  "agents": [
    {
      "id": "game-agent",
      "type": "Mx2JS"
    }
  ],

  "routes": [
    {
      "path": "/game/my-game/start",
      "handler": "[Pop start_game] [Wo 0]→[Ch'en score] [Xul]"
    }
  ],

  "db": {
    "path": "tapes/my-game/db/asx-db.json",
    "data": {
      "highscores": []
    }
  },

  "state": {
    "score": 0,
    "level": 1
  },

  "ui": "/tapes/my-game/public/index.html"
}
```

### 2. Load the Tape

```javascript
const tape = tapeSystem.loadTape(require('./tapes/my-game/tape.json'));
tapeSystem.mountToHive('my-game-tape', 'games');
```

### 3. Execute Tape Logic

```javascript
tapeSystem.executeTapeAction('my-game-tape', 'brain', {
  brainId: 'game-ai'
});
```

---

## 🧪 **Examples**

### Example 1: Simple Score Increment

**K'uhul:**
```kuhul
[Pop add_score]
  [Yax score]→[Wo 100]→[Sek add]→[Ch'en score]
[Xul]
```

**SCX:**
```
⟁Pop⟁add_score⟁Yax⟁score⟁Wo⟁100⟁Sek⟁add⟁Ch'en⟁score⟁Xul⟁
```

### Example 2: Health Check

**K'uhul:**
```kuhul
[Pop check_health]
  [Yax hp]→[Wo 0]→[Sek gt]→[Ch'en alive]
  [Yax alive]→[Sek not]→[Ch'en game_over]
[Xul]
```

**XJSON:**
```json
{
  "type": "logic",
  "lang": "kuhul",
  "name": "check_health",
  "code": [
    "[Pop check_health]",
    "  [Yax hp]→[Wo 0]→[Sek gt]→[Ch'en alive]",
    "  [Yax alive]→[Sek not]→[Ch'en game_over]",
    "[Xul]"
  ]
}
```

### Example 3: Enemy Movement AI

**K'uhul:**
```kuhul
[Pop update_enemies]
  [Yax enemy_count]→[Wo 0]→[Sek gt]→[Ch'en has_enemies]
  [Yax enemy_speed]→[Wo 0.5]→[Sek add]→[Ch'en enemy_speed]
  [Yax enemy_x]→[Yax enemy_speed]→[Sek add]→[Ch'en enemy_x]
[Xul]
```

---

## 🏗️ **Architecture**

### System Layers

```
┌─────────────────────────────────────┐
│      PRIME OS HUD / UI Layer        │
├─────────────────────────────────────┤
│         ASX Tape System             │
│    (Tape Loading & Execution)       │
├─────────────────────────────────────┤
│    KLH Orchestrator (Multi-Hive)    │
│  (Shard Management & Routing)       │
├─────────────────────────────────────┤
│  XJSON Runtime + K'uhul Interpreter │
│   (Code Execution & Logic)          │
├─────────────────────────────────────┤
│         SCX Cipher Layer            │
│    (Compression & Encoding)         │
├─────────────────────────────────────┤
│        Flash-RAM + Database         │
│    (State & Persistence)            │
└─────────────────────────────────────┘
```

### Multi-Hive Network

```
PRIME-04 Multi-Hive Server
├── Hive-1 (port 3001) - Dashboard
│   ├── Tape: system-monitor
│   └── Tape: status-panel
├── Hive-2 (port 3002) - Games
│   ├── Tape: space-invaders
│   ├── Tape: asteroids
│   └── Tape: snake
├── Hive-3 (port 3003) - Intel
│   └── Tape: mx2lm-brain
└── Hive-4 (port 3004) - Development
    └── Tape: code-editor
```

---

## 📖 **API Reference**

### KuhulInterpreter

```javascript
const kuhul = new KuhulInterpreter();

// Execute code
const result = kuhul.execute('[Wo 10]→[Ch\'en x]');

// Get variable
const value = kuhul.getVar('x');

// Set variable
kuhul.setVar('hp', 100);

// Reset interpreter
kuhul.reset();
```

### SCXCipher

```javascript
const scx = new SCXCipher();

// Encode K'uhul to SCX
const encoded = scx.encode('[Wo 10]→[Ch\'en x]');

// Decode SCX to K'uhul
const decoded = scx.decode('⟁Wo⟁10⟁Ch\'en⟁x⟁');

// Compress with stats
const result = scx.compress(kuhulCode);
// result.ratio: "45.2%"
```

### XJSONRuntime

```javascript
const xjson = new XJSONRuntime(kuhulInterpreter);

// Execute XJSON
const result = xjson.execute({
  "@if": { "op": "gt", "left": 5, "right": 3 },
  "@then": { "value": "greater" },
  "@else": { "value": "less" }
});

// Get/Set variables
xjson.setVar('score', 100);
const score = xjson.getVar('score');
```

### KLHOrchestrator

```javascript
const klh = new KLHOrchestrator();

// Register hive
klh.registerHive('games', { name: 'Games', port: 3002 });
klh.startHive('games');

// Register tape
klh.registerTape('my-game', { name: 'My Game', path: '/tapes/my-game' });

// Mount tape to hive
klh.mountTape('my-game', 'games');

// Inter-hive messaging
klh.sendToHive('dashboard', 'games', { action: 'status' });

// Get hive matrix
const matrix = klh.getHiveMatrix();
```

### TapeSystem

```javascript
const tapeSystem = new TapeSystem(klh, xjson);

// Load tape
const tape = tapeSystem.loadTape(tapeConfig);

// Mount to hive
tapeSystem.mountToHive('my-game-tape', 'games');

// Execute tape action
tapeSystem.executeTapeAction('my-game-tape', 'brain', { brainId: 'ai-brain' });

// Get tape state
const state = tapeSystem.getTapeState('my-game-tape');

// Package tape
const asxtape = tapeSystem.packageTape('my-game-tape');
```

---

## 🎨 **UI Customization**

The PRIME OS HUD uses CSS variables for easy theming:

```css
:root {
  --bg-primary: #0a0e1a;
  --bg-secondary: #12182b;
  --accent-cyan: #00ffff;
  --accent-green: #00ff88;
  --accent-orange: #ff8800;
  --accent-red: #ff0044;
}
```

---

## 🔥 **Advanced Features**

### Flash-RAM Symbols

Use symbolic glyphs in your games:

```json
{
  "flashRAM": {
    "symbols": {
      "@enemy": "👾",
      "@player": "🚀",
      "@bullet": "•"
    }
  }
}
```

### SCX Grams (Code Snippets)

Pre-compile common operations:

```json
{
  "flashRAM": {
    "grams": {
      "move_left": "[Yax x]→[Wo 5]→[Sek sub]→[Ch'en x]",
      "move_right": "[Yax x]→[Wo 5]→[Sek add]→[Ch'en x]"
    }
  }
}
```

### Multi-Hive Routing

Route requests across hives:

```javascript
klh.registerRoute('/api/score', 'my-game-tape', 'games', (data) => {
  return { score: tapeSystem.getTapeState('my-game-tape').state.score };
});
```

---

## 🧪 **Testing**

Run the test suite:

```bash
node test/test-suite.js
```

Test individual components:

```javascript
// Test K'uhul
const kuhul = new KuhulInterpreter();
kuhul.execute('[Wo 5]→[Wo 3]→[Sek add]→[Ch\'en result]');
console.log(kuhul.getVar('result')); // 8

// Test SCX
const scx = new SCXCipher();
const encoded = scx.encode('[Wo 10]→[Ch\'en x]');
const decoded = scx.decode(encoded);
console.log(decoded === '[Wo 10]→[Ch\'en x]'); // true
```

---

## 📦 **Project Structure**

```
free-games/
├── arcade/
│   ├── index.html          # Main UI
│   ├── style.css           # Cyberdeck styling
│   └── app.js              # Application logic
├── kuhul/
│   └── interpreter.js      # K'uhul interpreter
├── scx/
│   └── cipher.js           # SCX cipher system
├── xjson/
│   └── runtime.js          # XJSON runtime
├── klh/
│   └── orchestrator.js     # KLH orchestrator
├── tapes/
│   ├── tape-system.js      # Tape management
│   └── examples/
│       └── space-invaders.tape.json
└── README.md
```

---

## 🤝 **Contributing**

We welcome contributions!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📜 **License**

This project inherits the license from the parent repository.

---

## 🌟 **Credits**

Built with passion for retro computing, cyberdeck aesthetics, and functional programming.

**Technologies:**
- K'uhul Language
- SCX Cipher System
- XJSON Runtime
- KLH Multi-Hive Architecture
- Flash-RAM State Management

**Inspired by:**
- Mayan hieroglyphics
- Stack-based languages (Forth, PostScript)
- Classic arcade games
- Cyberpunk aesthetics
- Local-first software

---

## 🚀 **What's Next?**

- [ ] More arcade games (Pac-Man, Breakout, Galaga)
- [ ] Visual tape editor
- [ ] K'uhul debugger
- [ ] Multi-player networking
- [ ] Tape marketplace
- [ ] Mobile support
- [ ] WebGL renderer
- [ ] Sound engine
- [ ] AI opponents

---

## 💬 **Community**

Join us in building the future of retro-futuristic computing!

**Contact:**
- GitHub Issues: For bugs and features
- Discussions: For questions and ideas

---

<div align="center">

**⟁ ASX TAPE ARCADE ⟁**

*Where retro meets the future*

</div>
