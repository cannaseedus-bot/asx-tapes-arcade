# 🎨 ASX Tape Studio System

**Transform Tapes into Full Development Environments**

The ASX Tape Studio System is a revolutionary development environment that turns every tape into a complete, AI-powered workspace. Each studio provides:

- **Code Editor** (Monaco Editor with AI-powered suggestions)
- **Canvas** (for visual/game development)
- **Terminal** (integrated shell access)
- **AI Chat** (Cline AI coding assistant)
- **File Tree** (project explorer)
- **Visual Editor** (WYSIWYG component designer)

---

## 🚀 Quick Start

### 1. Create a New Tape

```javascript
// Open the Create Tape UI
window.location.href = '/studio/create-tape-ui.html';
```

### 2. Open a Tape in Studio

```javascript
// Open studio for a specific tape
const studio = studioSystem.openStudio('my-tape-id');
```

### 3. Use Cline AI Assistant

The Cline AI assistant is automatically available in every studio:

```javascript
// Send a message to Cline
const response = await studio.sendToCline('Help me optimize this code');
```

---

## 🧩 Core Components

### Studio System (`studio-system.js`)

The core orchestration engine that manages studio instances.

```javascript
class StudioSystem {
  openStudio(tapeId)           // Open a studio for a tape
  closeStudio(studioId)        // Close a studio
  sendToCline(studio, message) // Interact with Cline AI
  executeCommand(studio, cmd)  // Run terminal commands
  saveFile(studio, file)       // Save file changes
}
```

### Template Matcher (`template-matcher.js`)

Automatically matches project types to appropriate tape templates.

```javascript
const matcher = new TemplateMatcher();

// Match description to templates
const matches = matcher.matchTemplate('build a 2D platformer game');

// Get best match
const template = matcher.getBestMatch('AI model training studio');

// Create tape from template
const tapeConfig = matcher.createTapeFromTemplate('game-2d', {
  id: 'my-game',
  name: 'My Platformer',
  author: 'Developer'
});
```

### Available Templates

#### 🎮 Game Development
- **2D Game** - Canvas-based 2D games
- **3D Game** - WebGL/Three.js 3D games

#### 🤖 AI/ML
- **AI Studio** - Model training and inference
- **Multi-Agent System** - Agent orchestration

#### 🌐 Web Development
- **Web Application** - Frontend apps
- **API Server** - Backend/REST APIs

#### 📊 Data
- **Data Visualization** - Charts and analytics

#### 🔧 DevOps
- **Cline DevOps** - CI/CD automation with Cline
- **CLI Tool** - Command-line utilities

---

## 🤖 Cline AI Integration

Cline is an AI coding assistant integrated into every studio.

### Cline Agent Configuration

Located at: `/agents/cline-agent.json`

```json
{
  "id": "cline",
  "capabilities": [
    "code-generation",
    "debugging",
    "refactoring",
    "testing"
  ],
  "models": [
    {
      "id": "claude-sonnet-4.5",
      "context_window": 200000
    }
  ]
}
```

### Using Cline

#### 1. Chat Interface

```javascript
// Send message to Cline
await studio.components.aiChat.actions.send(
  'Create a function that validates email addresses'
);
```

#### 2. Code Analysis

```javascript
// Analyze current file
await studio.components.editor.actions.analyze(currentFile);
```

#### 3. File Operations

Cline can read, write, and edit files through the studio system.

---

## 🕸 KUHUL Multi-Agent Hive Integration

Enable multi-agent orchestration with KUHUL.

### Configuration

Enable KUHUL when creating a tape:

```javascript
{
  enableKuhul: true,
  hive: {
    enabled: true,
    repo: 'https://github.com/cannaseedus-bot/KUHUL.git',
    agents: ['cline', 'worker-1', 'worker-2']
  }
}
```

### Agent Collaboration

```javascript
// Delegate task to hive
const result = await klh.delegateTask('worker-1', {
  action: 'process-data',
  data: inputData
});

// Route message through hive
await klh.routeMessage('/hive/task/exec', {
  from: 'cline',
  to: 'worker-2',
  payload: taskData
});
```

---

## 📐 Studio UI Components

### Editor

- Monaco Editor with syntax highlighting
- AI-powered autocomplete
- Git integration
- Multi-tab support

### Terminal

- Xterm.js terminal emulator
- Full bash shell access
- Command history
- Tab support

### Canvas

- WebGL rendering
- 2D/3D modes
- Export capabilities
- Screenshot tool

### AI Chat

- Real-time Cline integration
- Code snippet support
- Context-aware suggestions
- Chat history export

### File Tree

- Project explorer
- File operations (create, delete, rename, move)
- Folder navigation
- Quick file search

### Visual Editor

- WYSIWYG component designer
- Design/Code/Split modes
- Component library
- Property inspector

---

## 🎨 Studio Layout

The studio uses a grid layout:

```
┌─────────────────────────────────────────────────┐
│ Header: Title, Tabs, Actions                    │
├──────────┬──────────────────────┬────────────────┤
│          │                      │                │
│  File    │   Code Editor        │   AI Chat      │
│  Tree    │                      │   (Cline)      │
│          │                      │                │
│  (20%)   ├──────────────────────┤   (30%)        │
│          │                      │                │
│          │   Terminal           │                │
│          │                      │                │
├──────────┴──────────────────────┴────────────────┤
│ Footer: Status, Branch, Position                │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Customization

### Themes

Available themes:
- `hellscape` - Green neon aesthetic
- `cyberpunk` - Purple/pink neon
- `retro` - Classic terminal green
- `minimal` - Clean and simple

### Editor Settings

```javascript
studio.config = {
  theme: 'hellscape',
  editorFont: 'JetBrains Mono',
  editorFontSize: 14,
  terminalFont: 'Fira Code',
  aiModel: 'claude-sonnet-4.5'
};
```

---

## 📦 Tape Structure

Every tape created through the studio follows this structure:

```
/tapes/<tape-id>/
  tape.json              # Tape manifest
  route.js               # Backend entry point

  /brains/               # AI logic modules
    <brain-name>.json

  /agents/               # Micro-agents
    <agent-name>.json

  /public/               # UI files
    index.html
    app.js
    style.css

  /db/                   # Database
    asx-db.json

  /logs/                 # Session logs
    <timestamp>.json
```

---

## 🌊 Workflow Example

### Creating a Game

1. **Create Tape**
   - Open Create Tape UI
   - Select "2D Game" template
   - Configure: title, author, theme
   - Enable Cline assistant

2. **Open in Studio**
   - Studio opens automatically
   - File tree shows game structure
   - Editor ready with game templates

3. **Develop with Cline**
   ```
   You: "Help me create a player sprite"
   Cline: "I'll create a player sprite class with movement..."
   [Cline generates code in editor]
   ```

4. **Test in Canvas**
   - Click "Open Canvas" button
   - Game renders in real-time
   - Test with keyboard input

5. **Deploy**
   ```bash
   git add .
   git commit -m "Add player sprite"
   git push
   ```

---

## 🔌 API Reference

### Studio System API

```javascript
// Open studio
const studio = studioSystem.openStudio(tapeId);

// Close studio
studioSystem.closeStudio(studioId);

// Send to Cline
const response = await studioSystem.sendToCline(studio, message);

// Execute command
const result = await studioSystem.executeCommand(studio, command);

// Save file
await studioSystem.saveFile(studio, {
  path: 'public/app.js',
  content: code
});

// Get studio layout
const layout = studioSystem.getStudioLayout(studio);
```

### Template Matcher API

```javascript
// Get all templates
const templates = matcher.getAllTemplates();

// Search templates
const results = matcher.searchTemplates('game');

// Get by category
const gameTemplates = matcher.getTemplatesByCategory('game');

// Match description
const matches = matcher.matchTemplate('build a web dashboard');

// Get best match
const template = matcher.getBestMatch('AI training studio');

// Create from template
const tapeConfig = matcher.createTapeFromTemplate(templateId, config);
```

---

## 🎯 Best Practices

### 1. Use Templates

Always start with a template - it sets up the proper structure and includes best practices.

### 2. Leverage Cline

Ask Cline for help with:
- Code generation
- Debugging
- Refactoring
- Testing
- Documentation

### 3. Organize Files

Keep your tape organized:
- **brains/** - Logic and AI
- **agents/** - Task executors
- **public/** - UI and assets
- **db/** - Data storage

### 4. Enable KUHUL for Complex Tasks

For multi-step, multi-agent workflows, enable KUHUL integration.

### 5. Export Chat History

Regularly export Cline chat history to preserve AI insights:

```javascript
const chatPath = studio.components.aiChat.actions.export();
```

---

## 🔗 Integration Points

### With ASX-HOLO

Studios integrate seamlessly with the ASX-HOLO holotape browser:

```javascript
// Load tape from holotape
const tape = asxHolo.loadTape(holoId);

// Open in studio
const studio = studioSystem.openStudio(tape.id);
```

### With KUHUL Hive

Multi-agent orchestration:

```javascript
// Register studio with hive
klh.registerStudio(studio.id, {
  agents: studio.tape.agents,
  routes: studio.tape.routes
});
```

### With Cline Bot

Direct integration with Cline repository:

```bash
git clone https://github.com/cannaseedus-bot/cline.git
```

---

## 🐛 Troubleshooting

### Studio Won't Open

Check that the tape is loaded:

```javascript
const tape = tapeSystem.loadedTapes.get(tapeId);
console.log(tape);
```

### Cline Not Responding

Verify agent configuration:

```javascript
console.log(studio.components.aiChat.agent);
```

### Terminal Commands Failing

Check working directory:

```javascript
console.log(studio.components.terminal.cwd);
```

---

## 📚 Resources

- [Cline Bot Repository](https://github.com/cannaseedus-bot/cline.git)
- [KUHUL Multi-Agent Hive](https://github.com/cannaseedus-bot/KUHUL.git)
- [ASX Tape Arcade](https://github.com/cannaseedus-bot/asx-tapes-arcade)

---

## 🎉 What's Next?

The Studio System transforms tapes from static modules into **living development environments**.

**Key Features:**
- ✅ Full IDE in the browser
- ✅ AI pair programming with Cline
- ✅ Multi-agent orchestration
- ✅ Template-based project creation
- ✅ Visual and code editing
- ✅ Integrated terminal and canvas

**This is the future of development - self-contained, AI-powered, tape-based studios.**

---

**Built with ⟁ by ASX Labs**
