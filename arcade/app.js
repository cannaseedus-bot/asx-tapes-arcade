/**
 * ASX TAPE ARCADE - Main Application
 * Integrates K'uhul, SCX, XJSON, KLH, and Tape System
 */

class ASXTapeArcade {
  constructor() {
    // Initialize core systems
    this.kuhul = new KuhulInterpreter();
    this.scx = new SCXCipher();
    this.xjson = new XJSONRuntime(this.kuhul);
    this.klh = new KLHOrchestrator();
    this.tapeSystem = new TapeSystem(this.klh, this.xjson);

    // State
    this.currentPanel = 'dashboard';
    this.activityLog = [];

    this.init();
  }

  init() {
    console.log('[ASX TAPE ARCADE] Initializing...');

    // Set up UI event listeners
    this.setupEventListeners();

    // Initialize default hives
    this.initializeDefaultHives();

    // Load default tapes
    this.loadDefaultTapes();

    // Start system updates
    this.startSystemUpdates();

    // Update time display
    this.updateTimeDisplay();

    console.log('[ASX TAPE ARCADE] System ready!');
    this.logActivity('System initialized and ready');
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchPanel(e.target.dataset.panel);
      });
    });

    // SCX Cipher
    document.getElementById('encode-btn')?.addEventListener('click', () => this.encodeSCX());
    document.getElementById('decode-btn')?.addEventListener('click', () => this.decodeSCX());

    // K'uhul Console
    document.getElementById('execute-kuhul-btn')?.addEventListener('click', () => this.executeKuhul());
    document.getElementById('clear-kuhul-btn')?.addEventListener('click', () => this.clearKuhul());

    // Hive management
    document.getElementById('create-hive-btn')?.addEventListener('click', () => this.createHive());
    document.getElementById('refresh-hives-btn')?.addEventListener('click', () => this.refreshHives());

    // Tape management
    document.getElementById('load-tape-btn')?.addEventListener('click', () => this.loadTape());
    document.getElementById('create-tape-btn')?.addEventListener('click', () => this.createTape());

    // Game controls
    document.querySelectorAll('.btn-play').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gameCard = e.target.closest('.game-card');
        const gameId = gameCard.dataset.game;
        this.launchGame(gameId);
      });
    });

    // AI Game Generator
    document.getElementById('ai-generator-btn')?.addEventListener('click', () => this.launchAIGenerator());

    // Doom Hellscape
    document.getElementById('hellscape-btn')?.addEventListener('click', () => this.launchHellscape());

    document.getElementById('close-game-btn')?.addEventListener('click', () => this.closeGame());
  }

  switchPanel(panelName) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(panel => {
      panel.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });

    // Show selected panel
    document.getElementById(`${panelName}-panel`)?.classList.add('active');

    // Activate selected tab
    document.querySelector(`[data-panel="${panelName}"]`)?.classList.add('active');

    this.currentPanel = panelName;
    this.logActivity(`Switched to ${panelName} panel`);
  }

  // SCX Cipher Methods
  encodeSCX() {
    const kuhulCode = document.getElementById('kuhul-input').value;

    if (!kuhulCode.trim()) {
      this.setStatusMessage('Please enter K\'uhul code', 'error');
      return;
    }

    try {
      const result = this.scx.compress(kuhulCode);
      document.getElementById('scx-output').value = result.compressed;
      document.getElementById('original-size').textContent = result.originalSize;
      document.getElementById('compressed-size').textContent = result.compressedSize;
      document.getElementById('compression-ratio').textContent = result.ratio;

      this.logActivity(`Encoded K'uhul to SCX (${result.ratio} compression)`);
      this.setStatusMessage('SCX encoding successful', 'success');
    } catch (error) {
      this.setStatusMessage(`Encoding error: ${error.message}`, 'error');
    }
  }

  decodeSCX() {
    const scxCode = document.getElementById('scx-output').value;

    if (!scxCode.trim()) {
      this.setStatusMessage('Please enter SCX cipher', 'error');
      return;
    }

    try {
      const kuhulCode = this.scx.decode(scxCode);
      document.getElementById('kuhul-input').value = kuhulCode;

      this.logActivity('Decoded SCX to K\'uhul');
      this.setStatusMessage('SCX decoding successful', 'success');
    } catch (error) {
      this.setStatusMessage(`Decoding error: ${error.message}`, 'error');
    }
  }

  // K'uhul Console Methods
  executeKuhul() {
    const code = document.getElementById('kuhul-code').value;

    if (!code.trim()) {
      this.setStatusMessage('Please enter K\'uhul code', 'error');
      return;
    }

    try {
      this.kuhul.reset();
      const result = this.kuhul.execute(code);

      const output = document.getElementById('kuhul-output');
      output.innerHTML += `<div class="output-line">
        <span style="color: var(--accent-cyan)">&gt;</span> ${this.formatOutput(result)}
      </div>`;
      output.scrollTop = output.scrollHeight;

      this.updateVariablesDisplay();
      this.logActivity('Executed K\'uhul code');
      this.setStatusMessage('Execution successful', 'success');
    } catch (error) {
      const output = document.getElementById('kuhul-output');
      output.innerHTML += `<div class="output-line" style="color: var(--accent-red)">
        <span>ERROR:</span> ${error.message}
      </div>`;
      this.setStatusMessage(`Execution error: ${error.message}`, 'error');
    }
  }

  clearKuhul() {
    document.getElementById('kuhul-code').value = '';
    document.getElementById('kuhul-output').innerHTML = '';
    this.kuhul.reset();
    this.updateVariablesDisplay();
    this.setStatusMessage('Console cleared', 'success');
  }

  updateVariablesDisplay() {
    const container = document.getElementById('kuhul-variables');
    container.innerHTML = '';

    for (const [name, value] of Object.entries(this.kuhul.variables)) {
      const varItem = document.createElement('div');
      varItem.className = 'variable-item';
      varItem.innerHTML = `
        <div class="name">${name}</div>
        <div class="value">${this.formatOutput(value)}</div>
      `;
      container.appendChild(varItem);
    }
  }

  formatOutput(value) {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  // Hive Management
  initializeDefaultHives() {
    const defaultHives = [
      { id: 'dashboard', name: 'Dashboard', port: 3001 },
      { id: 'games', name: 'Games', port: 3002 },
      { id: 'intel', name: 'Intel', port: 3003 },
      { id: 'dev', name: 'Development', port: 3004 }
    ];

    defaultHives.forEach(config => {
      this.klh.registerHive(config.id, config);
      this.klh.startHive(config.id);
    });

    this.logActivity(`Initialized ${defaultHives.length} default hives`);
    this.refreshHives();
  }

  createHive() {
    const name = prompt('Enter hive name:');
    if (!name) return;

    const port = parseInt(prompt('Enter port number:', '3005'));
    if (isNaN(port)) return;

    try {
      const hiveId = name.toLowerCase().replace(/\s+/g, '-');
      this.klh.registerHive(hiveId, { name, port });
      this.klh.startHive(hiveId);
      this.refreshHives();
      this.logActivity(`Created hive: ${name}`);
      this.setStatusMessage(`Hive ${name} created`, 'success');
    } catch (error) {
      this.setStatusMessage(`Hive creation error: ${error.message}`, 'error');
    }
  }

  refreshHives() {
    const container = document.getElementById('hive-list');
    container.innerHTML = '';

    const hiveMatrix = this.klh.getHiveMatrix();
    const hives = hiveMatrix.hives || [];

    hives.forEach(hive => {
      const hiveItem = document.createElement('div');
      hiveItem.className = 'hive-item';
      hiveItem.innerHTML = `
        <h3>${hive.name}</h3>
        <div style="margin-top: 0.5rem; color: var(--text-secondary);">
          <div>ID: ${hive.id}</div>
          <div>Port: ${hive.port}</div>
          <div>Status: <span style="color: ${hive.status === 'online' ? 'var(--accent-green)' : 'var(--accent-red)'}">${hive.status.toUpperCase()}</span></div>
          <div>Tapes: ${hive.tapeCount}</div>
          <div>Agents: ${hive.agentCount}</div>
        </div>
      `;
      container.appendChild(hiveItem);
    });

    // Update hive matrix dashboard
    const matrixContainer = document.getElementById('hive-matrix');
    if (matrixContainer) {
      matrixContainer.innerHTML = hives.map(h => `
        <div style="padding: 0.5rem; background: var(--bg-tertiary); margin: 0.25rem 0; border-left: 3px solid ${h.status === 'online' ? 'var(--accent-green)' : 'var(--accent-red)'}">
          ${h.name} : ${h.port}
        </div>
      `).join('');
    }
  }

  // Tape Management
  loadDefaultTapes() {
    const defaultTapes = [
      {
        id: 'space-invaders-tape',
        name: 'Space Invaders',
        version: '1.0.0',
        description: 'Classic space invaders arcade game',
        author: 'ASX Team',
        brains: [{ id: 'ai-brain', type: 'game-ai' }],
        agents: [{ id: 'game-agent', type: 'Mx2JS' }],
        routes: [{ path: '/game/space-invaders', handler: 'gameHandler' }],
        ui: '/tapes/space-invaders/public/index.html'
      },
      {
        id: 'snake-tape',
        name: 'Snake Game',
        version: '1.0.0',
        description: 'Classic snake game',
        author: 'ASX Team',
        brains: [{ id: 'snake-ai', type: 'game-ai' }],
        agents: [{ id: 'snake-agent', type: 'Mx2JS' }],
        routes: [{ path: '/game/snake', handler: 'snakeHandler' }],
        ui: '/tapes/snake/public/index.html'
      }
    ];

    defaultTapes.forEach(config => {
      const tape = this.tapeSystem.loadTape(config);
      this.tapeSystem.mountToHive(tape.id, 'games');
    });

    this.logActivity(`Loaded ${defaultTapes.length} default tapes`);
    this.refreshTapes();
  }

  loadTape() {
    alert('Load tape functionality - coming soon!');
  }

  createTape() {
    // Open the Create Tape UI with template matcher
    window.location.href = '/studio/create-tape-ui.html';
  }

  refreshTapes() {
    const container = document.getElementById('tape-list');
    if (!container) return;

    container.innerHTML = '';

    this.tapeSystem.loadedTapes.forEach((tape, tapeId) => {
      const tapeItem = document.createElement('div');
      tapeItem.className = 'tape-item';
      tapeItem.innerHTML = `
        <h3>${tape.name}</h3>
        <div style="margin-top: 0.5rem; color: var(--text-secondary);">
          <div>Version: ${tape.version}</div>
          <div>${tape.description}</div>
          <div style="margin-top: 0.5rem;">
            <span style="color: var(--accent-cyan)">Brains: ${tape.brains.length}</span> |
            <span style="color: var(--accent-green)">Agents: ${tape.agents.length}</span>
          </div>
        </div>
      `;
      container.appendChild(tapeItem);
    });

    // Update active tapes dashboard
    const activeTapesContainer = document.getElementById('active-tapes');
    if (activeTapesContainer) {
      activeTapesContainer.innerHTML = Array.from(this.tapeSystem.loadedTapes.values())
        .slice(0, 5)
        .map(t => `
          <div style="padding: 0.5rem; background: var(--bg-tertiary); margin: 0.25rem 0;">
            ${t.name} v${t.version}
          </div>
        `).join('');
    }
  }

  // Game Management
  launchGame(gameId) {
    console.log(`[ASX TAPE ARCADE] Launching game: ${gameId}`);
    this.logActivity(`Launched game: ${gameId}`);

    const container = document.getElementById('game-container');
    const title = document.getElementById('current-game-title');
    const canvas = document.getElementById('game-canvas');

    title.textContent = gameId.replace(/-/g, ' ').toUpperCase();
    container.classList.remove('hidden');

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    this.setStatusMessage(`Game ${gameId} launched`, 'success');

    // Simple demo - draw game placeholder
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ffff';
    ctx.font = '48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`${gameId.toUpperCase()}`, canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Courier New';
    ctx.fillText('(Game engine placeholder)', canvas.width / 2, canvas.height / 2 + 50);
  }

  closeGame() {
    document.getElementById('game-container').classList.add('hidden');
    this.logActivity('Closed game');
  }

  // AI Game Generator
  launchAIGenerator() {
    console.log('[ASX TAPE ARCADE] Launching AI Game Generator');
    this.logActivity('Launched AI Game Generator');

    const container = document.getElementById('game-container');
    const title = document.getElementById('current-game-title');
    const canvas = document.getElementById('game-canvas');

    title.textContent = 'GAME GENERATOR AI';
    container.classList.remove('hidden');

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    this.setStatusMessage('AI Game Generator initialized', 'success');

    // Draw AI generator interface
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gradient header
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 100);
    gradient.addColorStop(0, '#ff4444');
    gradient.addColorStop(0.5, '#ff8833');
    gradient.addColorStop(1, '#ffaa00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 100);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('GAME GENERATOR AI', canvas.width / 2, 60);

    ctx.fillStyle = '#f5e6e0';
    ctx.font = '24px Courier New';
    ctx.fillText('Describe your game concept:', canvas.width / 2, 180);
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#c89898';
    ctx.fillText('[AI will generate playable games from your prompt]', canvas.width / 2, 240);
    ctx.fillText('[Support for 2D platformers, puzzles, and arcade games]', canvas.width / 2, 280);
    ctx.fillText('[Generated games saved to your library]', canvas.width / 2, 320);

    // Draw input field placeholder
    ctx.fillStyle = 'rgba(255, 136, 51, 0.2)';
    ctx.fillRect(50, 380, 700, 60);
    ctx.strokeStyle = '#ff8833';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 380, 700, 60);
    ctx.fillStyle = '#c89898';
    ctx.font = '18px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('Example: "A retro platformer with lava and bouncing mechanics"', 70, 415);
  }

  // Doom World Hellscape
  launchHellscape() {
    console.log('[ASX TAPE ARCADE] Launching Doom World Hellscape');
    this.logActivity('Launched Doom World Hellscape');

    const container = document.getElementById('game-container');
    const title = document.getElementById('current-game-title');
    const canvas = document.getElementById('game-canvas');

    title.textContent = 'DOOM WORLD HELLSCAPE';
    container.classList.remove('hidden');

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    this.setStatusMessage('Hell dimension loaded', 'success');

    // Draw hellscape scene
    const ctx = canvas.getContext('2d');

    // Dark red background
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated hellfire background
    const time = Date.now() / 1000;
    for (let i = 0; i < 5; i++) {
      const y = (canvas.height / 5) * i;
      const gradient = ctx.createLinearGradient(0, y, canvas.width, y + canvas.height / 5);
      const hue = (time + i * 0.2) % 1;
      const intensity = 0.3 + 0.2 * Math.sin(time * 2 + i);
      gradient.addColorStop(0, `rgba(255, 68, 68, ${intensity * 0.3})`);
      gradient.addColorStop(0.5, `rgba(255, 136, 51, ${intensity * 0.4})`);
      gradient.addColorStop(1, `rgba(26, 10, 10, ${intensity * 0.5})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y, canvas.width, canvas.height / 5);
    }

    // Title with hellfire effect
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 30;
    ctx.font = 'bold 56px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('DOOM WORLD', canvas.width / 2, 80);
    ctx.fillText('HELLSCAPE', canvas.width / 2, 140);

    ctx.shadowColor = 'rgba(255, 68, 68, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 32px Courier New';
    ctx.fillText('🔥 ANTHROPIC OFFICE PARTY EDITION 🔥', canvas.width / 2, 200);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f5e6e0';
    ctx.font = '18px Courier New';
    ctx.fillText('Navigate the procedurally generated hellscape', canvas.width / 2, 280);
    ctx.fillText('Dodge demons, collect computational relics', canvas.width / 2, 320);
    ctx.fillText('Ascend to the Cloud Dimension', canvas.width / 2, 360);

    ctx.fillStyle = '#ff8833';
    ctx.font = 'bold 20px Courier New';
    ctx.fillText('[WASD to move] [SPACE to jump] [Click to interact]', canvas.width / 2, 450);

    // Draw hellscape terrain hints
    ctx.fillStyle = 'rgba(255, 68, 68, 0.2)';
    for (let i = 0; i < 8; i++) {
      const x = (canvas.width / 8) * i;
      ctx.fillRect(x, canvas.height - 40 - Math.sin(time + i) * 5, canvas.width / 8, 40);
    }

    ctx.fillStyle = '#c89898';
    ctx.font = '14px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Press PLAY to enter the abyss...', canvas.width / 2, 560);
  }

  // System Updates
  startSystemUpdates() {
    setInterval(() => {
      this.updateSystemMetrics();
      this.updateCounts();
    }, 1000);

    setInterval(() => {
      this.updateTimeDisplay();
    }, 1000);
  }

  updateSystemMetrics() {
    const status = this.klh.getStatus();
    const container = document.getElementById('system-metrics');

    if (container) {
      container.innerHTML = `
        <div style="padding: 0.5rem; background: var(--bg-tertiary); margin: 0.25rem 0;">
          Total Hives: <span style="color: var(--accent-cyan)">${status.hives}</span>
        </div>
        <div style="padding: 0.5rem; background: var(--bg-tertiary); margin: 0.25rem 0;">
          Online Hives: <span style="color: var(--accent-green)">${status.onlineHives}</span>
        </div>
        <div style="padding: 0.5rem; background: var(--bg-tertiary); margin: 0.25rem 0;">
          Mounted Tapes: <span style="color: var(--accent-cyan)">${status.mountedTapes}</span>
        </div>
        <div style="padding: 0.5rem; background: var(--bg-tertiary); margin: 0.25rem 0;">
          Active Agents: <span style="color: var(--accent-green)">${status.agents}</span>
        </div>
      `;
    }
  }

  updateCounts() {
    const status = this.klh.getStatus();
    document.getElementById('hive-count').textContent = status.hives;
    document.getElementById('tape-count').textContent = status.tapes;
  }

  updateTimeDisplay() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('time-display').textContent = timeString;
  }

  // Activity Logging
  logActivity(message) {
    const timestamp = new Date().toISOString();
    this.activityLog.unshift({ message, timestamp });

    // Keep only last 50 entries
    if (this.activityLog.length > 50) {
      this.activityLog = this.activityLog.slice(0, 50);
    }

    // Update activity log display
    const container = document.getElementById('activity-log');
    if (container) {
      container.innerHTML = this.activityLog.slice(0, 10).map(entry => `
        <div style="padding: 0.3rem; background: var(--bg-tertiary); margin: 0.2rem 0; font-size: 0.8rem;">
          <span style="color: var(--text-secondary)">${new Date(entry.timestamp).toLocaleTimeString()}</span>
          <span style="color: var(--text-primary)"> ${entry.message}</span>
        </div>
      `).join('');
    }
  }

  setStatusMessage(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.style.color = type === 'error' ? 'var(--accent-red)' :
                            type === 'success' ? 'var(--accent-green)' :
                            'var(--text-primary)';
    }

    this.logActivity(message);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.arcade = new ASXTapeArcade();
});
