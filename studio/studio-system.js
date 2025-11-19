/**
 * ASX Studio System
 * Full development environment for tapes
 *
 * Features:
 * - Code Editor (Monaco/CodeMirror)
 * - Canvas (for visual/game development)
 * - Terminal (shell access)
 * - AI Chat (Cline integration)
 * - File Tree (project explorer)
 * - Visual Editor (for UI/component design)
 */

class StudioSystem {
  constructor(tapeSystem, klh, clineAgent) {
    this.tapeSystem = tapeSystem;
    this.klh = klh;
    this.clineAgent = clineAgent;

    this.openStudios = new Map();
    this.activeStudio = null;
  }

  /**
   * Open a studio for a tape
   */
  openStudio(tapeId) {
    const tape = this.tapeSystem.loadedTapes.get(tapeId);

    if (!tape) {
      throw new Error(`Tape ${tapeId} not loaded`);
    }

    // Create studio instance
    const studio = {
      id: `studio-${tapeId}`,
      tapeId: tapeId,
      tape: tape,

      // Studio components
      components: {
        editor: null,
        canvas: null,
        terminal: null,
        aiChat: null,
        fileTree: null,
        visualEditor: null
      },

      // Studio state
      state: {
        openFiles: [],
        activeFile: null,
        terminalHistory: [],
        chatHistory: [],
        canvasMode: null
      },

      // Studio config
      config: {
        theme: 'hellscape',
        editorFont: 'JetBrains Mono',
        editorFontSize: 14,
        terminalFont: 'Fira Code',
        aiModel: 'claude-sonnet-4.5'
      },

      created: new Date().toISOString()
    };

    // Initialize components
    this.initializeEditor(studio);
    this.initializeCanvas(studio);
    this.initializeTerminal(studio);
    this.initializeAIChat(studio);
    this.initializeFileTree(studio);
    this.initializeVisualEditor(studio);

    this.openStudios.set(studio.id, studio);
    this.activeStudio = studio;

    console.log(`[Studio] Opened studio for tape: ${tapeId}`);

    return studio;
  }

  /**
   * Initialize code editor
   */
  initializeEditor(studio) {
    studio.components.editor = {
      type: 'monaco',
      language: 'javascript',
      theme: studio.config.theme,
      fontSize: studio.config.editorFontSize,

      // Editor capabilities
      features: {
        autocomplete: true,
        linting: true,
        formatting: true,
        gitIntegration: true,
        aiSuggestions: true
      },

      // Open files
      tabs: [],
      activeTab: null,

      // Editor actions
      actions: {
        save: (file) => this.saveFile(studio, file),
        format: (file) => this.formatFile(studio, file),
        analyze: (file) => this.analyzeWithCline(studio, file),
        lint: (file) => this.lintFile(studio, file)
      }
    };

    console.log(`[Studio] Initialized editor for ${studio.id}`);
  }

  /**
   * Initialize canvas
   */
  initializeCanvas(studio) {
    studio.components.canvas = {
      type: 'webgl',
      width: 1920,
      height: 1080,

      // Canvas modes
      modes: ['2d', '3d', 'webgl', 'game'],
      activeMode: '2d',

      // Canvas tools
      tools: {
        draw: true,
        preview: true,
        debug: true,
        record: true
      },

      // Rendering
      renderer: null,
      scene: null,

      // Canvas actions
      actions: {
        clear: () => this.clearCanvas(studio),
        export: (format) => this.exportCanvas(studio, format),
        screenshot: () => this.screenshotCanvas(studio)
      }
    };

    console.log(`[Studio] Initialized canvas for ${studio.id}`);
  }

  /**
   * Initialize terminal
   */
  initializeTerminal(studio) {
    studio.components.terminal = {
      type: 'xterm',
      shell: '/bin/bash',
      cwd: `/tapes/${studio.tapeId}`,

      // Terminal state
      history: [],
      output: [],

      // Terminal features
      features: {
        tabs: true,
        split: true,
        search: true,
        copy: true
      },

      // Terminal actions
      actions: {
        execute: (cmd) => this.executeCommand(studio, cmd),
        clear: () => this.clearTerminal(studio),
        copy: () => this.copyTerminalOutput(studio)
      }
    };

    console.log(`[Studio] Initialized terminal for ${studio.id}`);
  }

  /**
   * Initialize AI Chat (Cline)
   */
  initializeAIChat(studio) {
    studio.components.aiChat = {
      agent: this.clineAgent,
      model: studio.config.aiModel,

      // Chat state
      messages: [],
      context: {
        tape: studio.tape,
        openFiles: studio.state.openFiles,
        currentFile: studio.state.activeFile
      },

      // AI capabilities
      capabilities: {
        codeGeneration: true,
        debugging: true,
        refactoring: true,
        testing: true,
        documentation: true
      },

      // Chat actions
      actions: {
        send: (message) => this.sendToCline(studio, message),
        clear: () => this.clearChat(studio),
        export: () => this.exportChat(studio)
      }
    };

    // Send welcome message
    studio.components.aiChat.messages.push({
      role: 'assistant',
      content: this.clineAgent.prompts.welcome,
      timestamp: new Date().toISOString()
    });

    console.log(`[Studio] Initialized AI Chat (Cline) for ${studio.id}`);
  }

  /**
   * Initialize file tree
   */
  initializeFileTree(studio) {
    studio.components.fileTree = {
      root: `/tapes/${studio.tapeId}`,

      // File tree structure
      structure: {
        'brains/': [],
        'agents/': [],
        'public/': [],
        'db/': [],
        'logs/': [],
        'tape.json': 'file'
      },

      // File tree state
      expanded: new Set(),
      selected: null,

      // File operations
      operations: {
        create: (path, type) => this.createFileOrFolder(studio, path, type),
        delete: (path) => this.deleteFileOrFolder(studio, path),
        rename: (path, newName) => this.renameFileOrFolder(studio, path, newName),
        move: (from, to) => this.moveFileOrFolder(studio, from, to)
      }
    };

    console.log(`[Studio] Initialized file tree for ${studio.id}`);
  }

  /**
   * Initialize visual editor
   */
  initializeVisualEditor(studio) {
    studio.components.visualEditor = {
      type: 'wysiwyg',

      // Visual editor modes
      modes: ['design', 'code', 'split'],
      activeMode: 'design',

      // Components library
      components: [
        { type: 'button', icon: '🔘', label: 'Button' },
        { type: 'input', icon: '📝', label: 'Input' },
        { type: 'card', icon: '🃏', label: 'Card' },
        { type: 'panel', icon: '📋', label: 'Panel' },
        { type: 'canvas', icon: '🎨', label: 'Canvas' }
      ],

      // Visual editor state
      elements: [],
      selected: null,

      // Visual editor actions
      actions: {
        addElement: (type, props) => this.addElement(studio, type, props),
        removeElement: (id) => this.removeElement(studio, id),
        updateElement: (id, props) => this.updateElement(studio, id, props),
        export: (format) => this.exportDesign(studio, format)
      }
    };

    console.log(`[Studio] Initialized visual editor for ${studio.id}`);
  }

  /**
   * Send message to Cline AI
   */
  async sendToCline(studio, message) {
    const chat = studio.components.aiChat;

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Update context
    chat.context = {
      tape: studio.tape,
      openFiles: studio.state.openFiles,
      currentFile: studio.state.activeFile,
      recentCommands: studio.components.terminal.history.slice(-5)
    };

    // Call Cline agent via KLH
    const response = await this.klh.delegateTask('cline', {
      action: 'chat',
      message: message,
      context: chat.context
    });

    // Add AI response
    chat.messages.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString()
    });

    return response;
  }

  /**
   * Execute command in terminal
   */
  async executeCommand(studio, command) {
    const terminal = studio.components.terminal;

    // Add to history
    terminal.history.push(command);

    // Execute via KLH
    const result = await this.klh.delegateTask('shell-executor', {
      command: command,
      cwd: terminal.cwd
    });

    // Add output
    terminal.output.push({
      command: command,
      output: result.stdout,
      error: result.stderr,
      exitCode: result.exitCode,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  /**
   * Save file in editor
   */
  async saveFile(studio, file) {
    const editor = studio.components.editor;

    // Save via tape system
    await this.tapeSystem.executeTapeAction(studio.tapeId, 'file', {
      operation: 'write',
      path: file.path,
      content: file.content
    });

    // Update file in open tabs
    const tab = editor.tabs.find(t => t.path === file.path);
    if (tab) {
      tab.modified = false;
      tab.saved = new Date().toISOString();
    }

    console.log(`[Studio] Saved file: ${file.path}`);
  }

  /**
   * Analyze file with Cline
   */
  async analyzeWithCline(studio, file) {
    return await this.sendToCline(studio,
      `Please analyze this file: ${file.path}\n\n${file.content}`
    );
  }

  /**
   * Get studio layout config
   */
  getStudioLayout(studio) {
    return {
      type: 'grid',
      areas: [
        { component: 'fileTree', position: 'left', width: '20%' },
        { component: 'editor', position: 'center-top', height: '60%' },
        { component: 'terminal', position: 'center-bottom', height: '40%' },
        { component: 'aiChat', position: 'right', width: '30%' },
        { component: 'canvas', position: 'overlay', display: 'conditional' }
      ]
    };
  }

  /**
   * Close studio
   */
  closeStudio(studioId) {
    const studio = this.openStudios.get(studioId);

    if (!studio) {
      return false;
    }

    // Clean up components
    this.cleanupStudio(studio);

    this.openStudios.delete(studioId);

    if (this.activeStudio?.id === studioId) {
      this.activeStudio = null;
    }

    console.log(`[Studio] Closed studio: ${studioId}`);

    return true;
  }

  /**
   * Clean up studio resources
   */
  cleanupStudio(studio) {
    // Save any unsaved files
    const editor = studio.components.editor;
    const unsavedTabs = editor.tabs.filter(t => t.modified);

    if (unsavedTabs.length > 0) {
      console.warn(`[Studio] ${unsavedTabs.length} unsaved files in ${studio.id}`);
    }

    // Clear terminal
    if (studio.components.terminal) {
      studio.components.terminal.output = [];
    }

    // Export chat history
    if (studio.components.aiChat) {
      this.exportChat(studio);
    }
  }

  /**
   * Export chat history
   */
  exportChat(studio) {
    const chat = studio.components.aiChat;
    const exportPath = `/tapes/${studio.tapeId}/logs/cline-chat-${Date.now()}.json`;

    const chatExport = {
      tapeId: studio.tapeId,
      model: chat.model,
      messages: chat.messages,
      exported: new Date().toISOString()
    };

    // Save to logs
    this.tapeSystem.executeTapeAction(studio.tapeId, 'file', {
      operation: 'write',
      path: exportPath,
      content: JSON.stringify(chatExport, null, 2)
    });

    console.log(`[Studio] Exported chat to: ${exportPath}`);

    return exportPath;
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StudioSystem;
}
