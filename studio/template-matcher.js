/**
 * ASX Tape Template Matcher
 * Automatically matches project types to appropriate tape templates
 */

class TemplateMatcher {
  constructor() {
    this.templates = new Map();
    this.loadTemplates();
  }

  /**
   * Load all available tape templates
   */
  loadTemplates() {
    // Game Development Templates
    this.registerTemplate({
      id: 'game-2d',
      name: '2D Game',
      category: 'game',
      description: 'Template for 2D games with canvas rendering',
      tags: ['game', '2d', 'canvas', 'arcade'],
      structure: {
        'brains/game-ai.json': 'game-ai-brain',
        'brains/physics.json': 'physics-brain',
        'agents/renderer.json': 'canvas-renderer',
        'agents/input.json': 'input-handler',
        'public/index.html': 'game-ui',
        'public/game.js': 'game-logic',
        'public/sprites/': 'folder',
        'db/levels.json': 'game-database',
        'tape.json': 'game-tape-manifest'
      },
      patterns: [
        /game/i,
        /arcade/i,
        /2d/i,
        /sprite/i,
        /platformer/i,
        /shooter/i
      ]
    });

    this.registerTemplate({
      id: 'game-3d',
      name: '3D Game',
      category: 'game',
      description: 'Template for 3D games with WebGL',
      tags: ['game', '3d', 'webgl', 'three.js'],
      structure: {
        'brains/game-ai.json': 'game-ai-brain',
        'brains/physics.json': 'physics-3d-brain',
        'agents/renderer.json': 'webgl-renderer',
        'agents/input.json': 'input-handler',
        'public/index.html': 'game-ui',
        'public/game.js': 'game-3d-logic',
        'public/models/': 'folder',
        'public/shaders/': 'folder',
        'db/levels.json': 'game-database',
        'tape.json': 'game-tape-manifest'
      },
      patterns: [
        /3d/i,
        /webgl/i,
        /three\.?js/i,
        /babylon/i
      ]
    });

    // AI/ML Templates
    this.registerTemplate({
      id: 'ai-studio',
      name: 'AI Studio',
      category: 'ai',
      description: 'Template for AI/ML projects with model training',
      tags: ['ai', 'ml', 'training', 'inference'],
      structure: {
        'brains/model-config.json': 'model-brain',
        'brains/training-config.json': 'training-brain',
        'agents/trainer.json': 'training-agent',
        'agents/inference.json': 'inference-agent',
        'public/index.html': 'ai-studio-ui',
        'public/studio.js': 'ai-studio-logic',
        'dataset/train.jsonl': 'training-data',
        'dataset/eval.jsonl': 'eval-data',
        'models/': 'folder',
        'logs/': 'folder',
        'tape.json': 'ai-tape-manifest'
      },
      patterns: [
        /ai/i,
        /ml/i,
        /model/i,
        /train/i,
        /neural/i,
        /llm/i,
        /transformer/i
      ]
    });

    // Web App Templates
    this.registerTemplate({
      id: 'web-app',
      name: 'Web Application',
      category: 'web',
      description: 'Template for web applications',
      tags: ['web', 'app', 'ui', 'frontend'],
      structure: {
        'brains/app-logic.json': 'app-brain',
        'agents/api.json': 'api-agent',
        'public/index.html': 'app-ui',
        'public/app.js': 'app-logic',
        'public/components/': 'folder',
        'public/styles/': 'folder',
        'db/app-db.json': 'app-database',
        'routes/': 'folder',
        'tape.json': 'app-tape-manifest'
      },
      patterns: [
        /web/i,
        /app/i,
        /frontend/i,
        /ui/i,
        /dashboard/i
      ]
    });

    // Data Visualization Templates
    this.registerTemplate({
      id: 'data-viz',
      name: 'Data Visualization',
      category: 'data',
      description: 'Template for data visualization projects',
      tags: ['data', 'viz', 'charts', 'analytics'],
      structure: {
        'brains/data-processor.json': 'data-brain',
        'agents/analyzer.json': 'analysis-agent',
        'public/index.html': 'viz-ui',
        'public/viz.js': 'viz-logic',
        'public/charts/': 'folder',
        'dataset/data.json': 'data-file',
        'db/processed.json': 'processed-database',
        'tape.json': 'viz-tape-manifest'
      },
      patterns: [
        /data/i,
        /viz/i,
        /chart/i,
        /graph/i,
        /analytics/i,
        /dashboard/i
      ]
    });

    // CLI Tool Templates
    this.registerTemplate({
      id: 'cli-tool',
      name: 'CLI Tool',
      category: 'tool',
      description: 'Template for command-line tools',
      tags: ['cli', 'tool', 'automation', 'script'],
      structure: {
        'brains/cli-logic.json': 'cli-brain',
        'agents/executor.json': 'executor-agent',
        'commands/': 'folder',
        'scripts/': 'folder',
        'db/config.json': 'config-database',
        'logs/': 'folder',
        'tape.json': 'cli-tape-manifest'
      },
      patterns: [
        /cli/i,
        /tool/i,
        /command/i,
        /script/i,
        /automation/i
      ]
    });

    // API/Backend Templates
    this.registerTemplate({
      id: 'api-server',
      name: 'API Server',
      category: 'backend',
      description: 'Template for API servers and backends',
      tags: ['api', 'backend', 'server', 'rest'],
      structure: {
        'brains/api-logic.json': 'api-brain',
        'agents/router.json': 'router-agent',
        'agents/db.json': 'database-agent',
        'routes/': 'folder',
        'middleware/': 'folder',
        'db/api-db.json': 'api-database',
        'logs/': 'folder',
        'tape.json': 'api-tape-manifest'
      },
      patterns: [
        /api/i,
        /server/i,
        /backend/i,
        /rest/i,
        /graphql/i
      ]
    });

    // Multi-Agent System Templates
    this.registerTemplate({
      id: 'multi-agent',
      name: 'Multi-Agent System',
      category: 'agent',
      description: 'Template for multi-agent orchestration',
      tags: ['agents', 'multi-agent', 'orchestration', 'hive'],
      structure: {
        'brains/orchestrator.json': 'orchestrator-brain',
        'brains/coordinator.json': 'coordinator-brain',
        'agents/worker-1.json': 'worker-agent',
        'agents/worker-2.json': 'worker-agent',
        'agents/manager.json': 'manager-agent',
        'public/index.html': 'agent-ui',
        'public/dashboard.js': 'agent-dashboard',
        'db/tasks.json': 'task-database',
        'logs/': 'folder',
        'tape.json': 'agent-tape-manifest'
      },
      patterns: [
        /agent/i,
        /multi-agent/i,
        /hive/i,
        /orchestrat/i,
        /swarm/i
      ]
    });

    // Cline DevOps Template
    this.registerTemplate({
      id: 'cline-devops',
      name: 'Cline DevOps',
      category: 'devops',
      description: 'Template for DevOps automation with Cline',
      tags: ['devops', 'cline', 'automation', 'ci-cd'],
      structure: {
        'brains/pipeline.json': 'pipeline-brain',
        'brains/deployment.json': 'deployment-brain',
        'agents/cline.json': 'cline-agent',
        'agents/git.json': 'git-agent',
        'agents/builder.json': 'builder-agent',
        'public/index.html': 'devops-ui',
        'public/pipeline.js': 'pipeline-logic',
        'db/builds.json': 'build-database',
        'logs/': 'folder',
        'scripts/': 'folder',
        'tape.json': 'devops-tape-manifest'
      },
      patterns: [
        /devops/i,
        /cline/i,
        /ci-cd/i,
        /pipeline/i,
        /deploy/i,
        /build/i
      ]
    });

    console.log(`[Template Matcher] Loaded ${this.templates.size} templates`);
  }

  /**
   * Register a template
   */
  registerTemplate(template) {
    this.templates.set(template.id, template);
  }

  /**
   * Match project description to templates
   */
  matchTemplate(description) {
    const matches = [];

    for (const [id, template] of this.templates) {
      let score = 0;

      // Check patterns
      for (const pattern of template.patterns) {
        if (pattern.test(description)) {
          score += 10;
        }
      }

      // Check tags
      for (const tag of template.tags) {
        if (description.toLowerCase().includes(tag.toLowerCase())) {
          score += 5;
        }
      }

      if (score > 0) {
        matches.push({
          template: template,
          score: score
        });
      }
    }

    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }

  /**
   * Get best template match
   */
  getBestMatch(description) {
    const matches = this.matchTemplate(description);

    if (matches.length === 0) {
      return this.templates.get('web-app'); // Default fallback
    }

    return matches[0].template;
  }

  /**
   * Create tape from template
   */
  createTapeFromTemplate(templateId, config) {
    const template = this.templates.get(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const tapeConfig = {
      id: config.id || this.generateTapeId(template),
      name: config.name || template.name,
      version: '1.0.0',
      description: config.description || template.description,
      author: config.author || 'Anonymous',

      // Template metadata
      template: {
        id: template.id,
        category: template.category,
        tags: template.tags
      },

      // Initialize from template structure
      brains: this.initializeBrains(template),
      agents: this.initializeAgents(template),
      routes: [],
      ui: this.getUIPath(template),

      db: {
        path: `tapes/${config.id}/db/asx-db.json`,
        data: {}
      },

      state: {},
      flashRAM: {}
    };

    return tapeConfig;
  }

  /**
   * Initialize brains from template
   */
  initializeBrains(template) {
    const brains = [];

    for (const [path, type] of Object.entries(template.structure)) {
      if (path.startsWith('brains/') && type.includes('brain')) {
        brains.push({
          id: this.extractId(path),
          type: type,
          logic: null
        });
      }
    }

    return brains;
  }

  /**
   * Initialize agents from template
   */
  initializeAgents(template) {
    const agents = [];

    for (const [path, type] of Object.entries(template.structure)) {
      if (path.startsWith('agents/') && type.includes('agent')) {
        agents.push({
          id: this.extractId(path),
          type: type,
          status: 'ready'
        });
      }
    }

    return agents;
  }

  /**
   * Get UI path from template
   */
  getUIPath(template) {
    for (const [path, type] of Object.entries(template.structure)) {
      if (path.includes('index.html')) {
        return `/tapes/{{tapeId}}/${path}`;
      }
    }

    return null;
  }

  /**
   * Extract ID from path
   */
  extractId(path) {
    const filename = path.split('/').pop();
    return filename.replace(/\.(json|js)$/, '');
  }

  /**
   * Generate tape ID
   */
  generateTapeId(template) {
    return `${template.id}-${Date.now()}`;
  }

  /**
   * Get all templates
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category) {
    return Array.from(this.templates.values()).filter(
      t => t.category === category
    );
  }

  /**
   * Search templates
   */
  searchTemplates(query) {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.templates.values()).filter(template => {
      return (
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateMatcher;
}
