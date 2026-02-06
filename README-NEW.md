# ⟁ ASX Tapes Arcade

**The Post-Framework Future of Web Development**

[![Live Demo](https://img.shields.io/badge/live-demo-visit-0066FF?style=for-the-badge)](https://cannaseedus-bot.github.io/asx-tapes-arcade/)

🔥 **ASX is not a framework. ASX is the replacement.**

This repository establishes a new paradigm where:
- ✅ **Git repositories ARE deployable software** (just add `tape.json`)
- ✅ **Zero build step required** (pure HTML/JS/CSS)
- ✅ **Fractal composition** (tapes load tapes infinitely)
- ✅ **AI-native** (agents, brains, and automation built-in)
- ✅ **Eternal compatibility** (never breaks, runs forever)

---

## 🚀 Quick Install (One Command)

### Git Bash / Terminal (Windows/Mac/Linux)

```bash
# Install to your web server root
cd /var/www/html  # Linux/Mac with Apache
# OR
cd C:/xampp/htdocs  # Windows with XAMPP
# OR
cd /Applications/MAMP/htdocs  # Mac with MAMP

# Clone and done!
git clone https://github.com/cannaseedus-bot/asx-tapes-arcade.git
cd asx-tapes-arcade
```

**That's it!** Open your browser:
```
http://localhost/asx-tapes-arcade/arcade/
```

No `npm install`. No build step. **It just works.**

---

## 📖 What Is This?

ASX Tapes Arcade is a **complete software ecosystem** that replaces the React/Vite/Node.js paradigm with something radically simpler:

### The Core Insight

> **"A Git repository IS a Tape."**

Just add a `tape.json` file to any repo, and it becomes instantly deployable software.

### What's a Tape?

A **Tape** is a self-contained software capsule (like a Sega Genesis cartridge or Fallout Holotape):

```
my-app/  (Git repo)
  tape.json          ← Add this file
  public/
    index.html
  route.php
  agents/
  brains/
  db/
```

**Result:** Your Git repo is now a portable, loadable, composable application module.

### What's GHOST?

**GHOST** (Global Host Orchestration Specification for Tapes) is the universal protocol that:
- Discovers tapes
- Loads tapes
- Routes between tapes
- Connects external AI agents

It's like a "tape deck" that plays any software cartridge.

### What's HOLO?

**HOLO** is the green phosphor CRT aesthetic - the universal visual language for all ASX tapes. Think Fallout + Alien + NeXTSTEP terminals.

---

## 🎯 The Revolution

### Before ASX:
```bash
git clone my-react-app
cd my-react-app
npm install        # 500MB node_modules
npm run dev        # Start dev server
npm run build      # Compile
npm run deploy     # Deploy
```

**Problems:**
- ❌ Massive dependencies
- ❌ Build tools that change every year
- ❌ Framework churn (React 16 → 17 → 18 → 19)
- ❌ Breaks in 6 months
- ❌ Not portable

### After ASX:
```bash
git clone my-tape
cd my-tape
# Open in browser. Done.
```

**Benefits:**
- ✅ Zero dependencies
- ✅ No build step
- ✅ Never breaks (standards-based)
- ✅ Fully portable
- ✅ Works in 20 years

---

## 🧩 The Three Pillars

### 1. Tapes (Software Capsules)

Every tape is complete and self-contained:
- Own UI (`public/`)
- Own API (`route.php`)
- Own agents (`agents/`)
- Own database (`db/`)
- Own brains (`brains/`)

**Tapes are fractal** - they work at any scale:
- Calculator tape
- Game tape
- AI trainer tape
- Complete operating system tape

### 2. GHOST (Universal Host)

The protocol that makes tapes work:

**Endpoints:**
```
GET  /ghost/tapes              # List all tapes
GET  /ghost/tapes/:id          # Get tape info
POST /ghost/proxy/:id          # Call tape API
POST /ghost/proxy-external/:s  # Call external service
POST /ghost/swarm/route        # Route to best AI agent
```

**Features:**
- Auto-discovers tapes from `/tapes/*/tape.json`
- Generates registry (`ghost.json`)
- Enables tape-to-tape communication
- Routes to external AI agents (Ollama, MX2LM, Qwen, Cline)

### 3. HOLO UI (Visual Standard)

The green phosphor CRT aesthetic ensures all tapes look cohesive:
- Scanlines and CRT glow
- Monospace typography
- Card-based tape grids
- Status indicators
- "Active: TAPE_NAME" display

---

## 🌐 Architecture

```
┌──────────────────────────────────────┐
│  GitHub (Tape Marketplace)           │
│  Every repo with tape.json           │
└──────────────────────────────────────┘
              ↓ git clone
┌──────────────────────────────────────┐
│  /tapes/                             │
│  ├── space-invaders/                 │
│  ├── cline-devops/                   │
│  └── my-app/                         │
└──────────────────────────────────────┘
              ↓ GHOST scans
┌──────────────────────────────────────┐
│  GHOST Host                          │
│  - Discovers all tapes               │
│  - Generates ghost.json              │
│  - Exposes /ghost/* API              │
└──────────────────────────────────────┘
              ↓ Renders in
┌──────────────────────────────────────┐
│  ASX-HOLO Browser                    │
│  - Green phosphor CRT UI             │
│  - Grid of tape cards                │
│  - Click to load any tape            │
└──────────────────────────────────────┘
```

---

## 📁 What's Inside

```
asx-tapes-arcade/
├── 📁 ghost/              # GHOST v1.0 implementation
│   ├── index.php         # Universal tape host
│   ├── settings.json     # External AI services
│   └── swarm.json        # Agent routing config
│
├── 📁 arcade/             # ASX-HOLO browser UI
│   ├── index.html        # Main interface
│   └── app.js            # Tape grid renderer
│
├── 📁 tapes/              # Tape library
│   └── examples/         # Example tapes
│
├── 📁 studio/             # Development environment
│   ├── studio-ui.html    # Full IDE for tapes
│   ├── create-tape-ui.html
│   └── template-matcher.js
│
├── 📁 agents/             # AI agent definitions
│   └── cline-agent.json  # Cline coding assistant
│
├── 📁 tools/              # Developer tools
│   └── git-to-tape.js    # Convert any repo to tape
│
├── 📁 klh/                # KLH Orchestrator
├── 📁 kuhul/              # K'uhul Interpreter
├── 📁 scx/                # SCX Cipher
├── 📁 xjson/              # XJSON Runtime
│
└── 📚 Documentation/
    ├── INSTALL.md                  # Detailed install guide
    ├── ASX-REPLACES-FRAMEWORKS.md  # Why ASX replaces React
    ├── GHOST-SPECIFICATION.md      # GHOST protocol spec
    ├── ASX-TAPE-STANDARD-v1-RFC.md # Tape standard
    ├── HOLO-UI-STANDARD.html       # Visual design system
    └── README-ASX-PARADIGM.md      # Complete vision
```

---

## 🎮 Try It Now

### 1. Install

```bash
git clone https://github.com/cannaseedus-bot/asx-tapes-arcade.git
cd asx-tapes-arcade
```

### 2. Open in Browser

```
http://localhost/asx-tapes-arcade/arcade/
```

### 3. Create a Tape

Click **"CREATE TAPE"** button, or:

```bash
cd tapes
mkdir my-tape
cd my-tape

# Create manifest
echo '{
  "id": "my-tape",
  "name": "My Tape",
  "version": "1.0.0",
  "entry": "/tapes/my-tape/public/index.html"
}' > tape.json

# Create UI
mkdir public
echo "<h1>Hello ASX!</h1>" > public/index.html
```

**Done!** GHOST auto-discovers it:
```
http://localhost/asx-tapes-arcade/ghost/tapes
```

---

## 🔥 Key Features

### Zero Build Step
Pure HTML/JS/CSS. No compilation needed.

### Fractal Composition
Tapes load tapes infinitely:
```javascript
// Tape A loads Tape B
const response = await fetch('/ghost/proxy/tape-b', {
  method: 'POST',
  body: JSON.stringify({ method: 'getData' })
});
```

### AI-Native
Built-in agents (Cline, Ollama, MX2LM, Qwen):
```bash
curl -X POST /ghost/swarm/route \
  -d '{"task": "code_review", "payload": {...}}'
```

### Instant Deploy
```bash
git clone repo
# That's it. It runs.
```

### GitHub as Marketplace
Every repo with `tape.json` becomes discoverable, loadable software.

---

## 🛠️ Convert Any Repo to Tape

Use the git-to-tape tool:

```bash
cd /path/to/your/existing/repo

# Run converter
node /path/to/asx-tapes-arcade/tools/git-to-tape.js

# Follow prompts - it creates tape.json automatically

# Move to tapes directory
mv . /path/to/asx-tapes-arcade/tapes/my-app

# Done! GHOST discovers it automatically
```

---

## 📚 Documentation

Read these in order to understand the paradigm:

1. **[INSTALL.md](INSTALL.md)** - Detailed installation guide
2. **[README-ASX-PARADIGM.md](README-ASX-PARADIGM.md)** - Complete vision overview
3. **[ASX-REPLACES-FRAMEWORKS.md](ASX-REPLACES-FRAMEWORKS.md)** - Why ASX replaces React/Vite
4. **[GHOST-SPECIFICATION.md](GHOST-SPECIFICATION.md)** - GHOST protocol specification
5. **[ASX-TAPE-STANDARD-v1-RFC.md](ASX-TAPE-STANDARD-v1-RFC.md)** - Official tape standard
6. **[HOLO-UI-STANDARD.html](HOLO-UI-STANDARD.html)** - Visual design system (open in browser)
7. **[studio/README.md](studio/README.md)** - Development environment guide

---

## 🌟 What This Replaces

| Traditional | ASX |
|-------------|-----|
| React | Pure HTML/JS in tapes |
| Vite/Webpack | Zero build (just load) |
| npm install | git clone (done) |
| node_modules | Self-contained tapes |
| package.json | tape.json |
| VS Code | ASX Studio (tape) |
| Electron | Tapes (run in browser) |
| Docker | Tapes (portable) |
| Vercel/Netlify | Any HTTP server |

---

## 🔗 Ecosystem

### Core Projects

- **[Cline Bot](https://github.com/cannaseedus-bot/cline)** - AI coding assistant
- **[KUHUL Hive](https://github.com/cannaseedus-bot/KUHUL)** - Multi-agent orchestration

### External Integrations

- **Ollama** - Local LLMs
- **MX2LM** - Reasoning models
- **Qwen** - Fast inference
- **K'uhul** - GPU/TPU compute

All connected through GHOST protocol.

---

## 💡 Use Cases

### For Developers
- Build apps without frameworks
- Deploy with git clone
- Never deal with node_modules again
- Ship portable software

### For AI Researchers
- Create AI-native apps
- Integrate multiple models
- Track training data
- Build multi-agent systems

### For Game Developers
- Ship browser games
- No build step needed
- Portable to any server
- Infinite composition

### For System Builders
- Create operating systems as tapes
- Nest systems infinitely
- Modular architecture
- Hot-swappable components

---

## 🎯 Examples

### Example 1: Space Invaders Game

```
/tapes/space-invaders/
  tape.json
  public/
    index.html
    game.js
  agents/
    enemy-ai.json
```

Load it:
```
http://localhost/asx-tapes-arcade/tapes/space-invaders/public/index.html
```

### Example 2: AI Trainer

```
/tapes/ai-trainer/
  tape.json
  public/
    index.html
  agents/
    trainer.json
  dataset/
    train.jsonl
  brains/
    model-config.json
```

### Example 3: Multi-Tape System

Tape A calls Tape B:
```javascript
// In Tape A
const result = await fetch('/ghost/proxy/tape-b', {
  method: 'POST',
  body: JSON.stringify({
    path: '/api/process',
    payload: { data: 'value' }
  })
});
```

---

## ⚡ The ASX Guarantee

**Your tapes will work in 10 years. In 20 years. Forever.**

Why?
- ✅ Standards-based (HTML, CSS, JS)
- ✅ No external dependencies
- ✅ No framework to update
- ✅ No breaking changes
- ✅ No vendor lock-in

**Write once, run forever.**

---

## 🚀 Getting Started

### Absolute Beginner

1. Install: `git clone https://github.com/cannaseedus-bot/asx-tapes-arcade.git`
2. Open: `http://localhost/asx-tapes-arcade/arcade/`
3. Click: **"CREATE TAPE"**
4. Done!

### Experienced Developer

1. Read: `ASX-REPLACES-FRAMEWORKS.md`
2. Study: Example tapes in `/tapes/examples/`
3. Convert: Your existing repos with `git-to-tape.js`
4. Deploy: Drop in `/tapes/` directory

### System Architect

1. Review: `GHOST-SPECIFICATION.md`
2. Implement: GHOST host for your platform
3. Design: Multi-tape ecosystems
4. Build: Fractal system architectures

---

## 🤝 Contributing

This is the **post-framework future**. We welcome:

- 🎮 Game tapes
- 🧠 AI tapes
- 🛠️ Tool tapes
- 📚 Documentation
- 🐛 Bug fixes
- 💡 New ideas

Just add `tape.json` to your project and share!

---

## 📜 License

MIT - Build whatever you want. No restrictions. Forever.

---

## 🌐 Links

- **Live Demo:** https://cannaseedus-bot.github.io/asx-tapes-arcade/
- **Repository:** https://github.com/cannaseedus-bot/asx-tapes-arcade
- **Cline Bot:** https://github.com/cannaseedus-bot/cline
- **KUHUL Hive:** https://github.com/cannaseedus-bot/KUHUL

---

## 💬 Support

Questions? Issues? Ideas?

- **GitHub Issues:** https://github.com/cannaseedus-bot/asx-tapes-arcade/issues
- **Detailed Install Guide:** [INSTALL.md](INSTALL.md)
- **Full Documentation:** See `/docs/` directory

---

## 🏆 Credits

**Built with ⟁ by ASX Labs**

Special thanks to:
- The open source community
- GitHub for hosting the future
- Everyone who believed in the post-framework paradigm

---

## 🔮 The Vision

**ASX is not a framework. ASX is the replacement.**

We envision a future where:
- Every Git repo is instantly deployable
- No build tools are needed
- Software never breaks
- Composition is infinite
- AI is native
- Everything is portable

**This is that future.**

**Welcome to the ASX paradigm.** ⟁

---

*"Where Git repos become living software and tapes replace frameworks forever."*
