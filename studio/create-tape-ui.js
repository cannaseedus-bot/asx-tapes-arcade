/**
 * Create Tape UI Logic
 */

class CreateTapeUI {
  constructor() {
    this.templateMatcher = new TemplateMatcher();
    this.selectedTemplate = null;
    this.currentStep = 1;

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadTemplates();
  }

  bindEvents() {
    // Close button
    document.getElementById('close-btn').addEventListener('click', () => {
      this.close();
    });

    // Template search
    document.getElementById('template-search-input').addEventListener('input', (e) => {
      this.searchTemplates(e.target.value);
    });

    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterByCategory(e.target.dataset.category);
      });
    });

    // Step navigation
    document.getElementById('next-to-config-btn').addEventListener('click', () => {
      this.goToStep(2);
    });

    document.getElementById('back-to-template-btn').addEventListener('click', () => {
      this.goToStep(1);
    });

    document.getElementById('next-to-structure-btn').addEventListener('click', () => {
      this.goToStep(3);
    });

    document.getElementById('back-to-config-btn').addEventListener('click', () => {
      this.goToStep(2);
    });

    // Create tape button
    document.getElementById('create-tape-btn').addEventListener('click', () => {
      this.createTape();
    });

    // Success actions
    document.getElementById('open-studio-btn').addEventListener('click', () => {
      this.openInStudio();
    });

    document.getElementById('create-another-btn').addEventListener('click', () => {
      this.reset();
    });
  }

  loadTemplates() {
    const templates = this.templateMatcher.getAllTemplates();
    this.renderTemplates(templates);
  }

  renderTemplates(templates) {
    const grid = document.getElementById('template-grid');
    grid.innerHTML = '';

    templates.forEach(template => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.dataset.templateId = template.id;

      card.innerHTML = `
        <h3>${template.name}</h3>
        <p>${template.description}</p>
        <div class="template-tags">
          ${template.tags.map(tag => `
            <span class="template-tag">${tag}</span>
          `).join('')}
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectTemplate(template);
      });

      grid.appendChild(card);
    });
  }

  selectTemplate(template) {
    this.selectedTemplate = template;

    // Update UI
    document.querySelectorAll('.template-card').forEach(card => {
      card.classList.remove('selected');
    });

    const selectedCard = document.querySelector(`[data-template-id="${template.id}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }

    // Enable next button
    document.getElementById('next-to-config-btn').disabled = false;

    // Pre-fill config form
    this.prefillConfig(template);
  }

  prefillConfig(template) {
    // Set type based on template category
    const typeMapping = {
      'game': 'game',
      'ai': 'ai-studio',
      'web': 'app',
      'devops': 'tool',
      'data': 'app',
      'agent': 'app',
      'tool': 'tool',
      'backend': 'app'
    };

    document.getElementById('tape-type').value = typeMapping[template.category] || 'app';

    // Set tags
    document.getElementById('tape-tags').value = template.tags.join(', ');

    // Set description
    document.getElementById('tape-description').value = template.description;
  }

  searchTemplates(query) {
    if (!query.trim()) {
      this.loadTemplates();
      return;
    }

    const results = this.templateMatcher.searchTemplates(query);
    this.renderTemplates(results);
  }

  filterByCategory(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Filter templates
    if (category === 'all') {
      this.loadTemplates();
    } else {
      const filtered = this.templateMatcher.getTemplatesByCategory(category);
      this.renderTemplates(filtered);
    }
  }

  goToStep(stepNumber) {
    // Validate current step
    if (!this.validateCurrentStep()) {
      return;
    }

    // Hide all steps
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('active');
    });

    // Show target step
    const steps = ['template-selection', 'tape-config', 'tape-structure'];
    const targetStep = document.getElementById(steps[stepNumber - 1]);
    if (targetStep) {
      targetStep.classList.add('active');
      this.currentStep = stepNumber;

      // Populate structure tree if going to step 3
      if (stepNumber === 3) {
        this.populateStructureTree();
      }
    }
  }

  validateCurrentStep() {
    if (this.currentStep === 1) {
      if (!this.selectedTemplate) {
        alert('Please select a template');
        return false;
      }
    } else if (this.currentStep === 2) {
      const title = document.getElementById('tape-title').value;
      if (!title.trim()) {
        alert('Please enter a title');
        return false;
      }
    }

    return true;
  }

  populateStructureTree() {
    const tree = document.getElementById('structure-tree');
    tree.innerHTML = '';

    if (!this.selectedTemplate) return;

    const structure = this.selectedTemplate.structure;

    // Group by folder
    const folders = {};

    for (const [path, type] of Object.entries(structure)) {
      const parts = path.split('/');

      if (parts.length === 1) {
        // Root file
        this.addStructureItem(tree, path, type, 0);
      } else {
        // File in folder
        const folder = parts[0];

        if (!folders[folder]) {
          folders[folder] = [];
        }

        folders[folder].push({ path, type });
      }
    }

    // Render folders
    for (const [folder, items] of Object.entries(folders)) {
      const folderDiv = this.addStructureItem(tree, folder + '/', 'folder', 0);

      items.forEach(item => {
        this.addStructureItem(folderDiv, item.path.replace(folder + '/', ''), item.type, 1);
      });
    }
  }

  addStructureItem(container, name, type, indent) {
    const item = document.createElement('div');
    item.className = `structure-item ${type === 'folder' ? 'folder' : 'file'}`;
    item.style.paddingLeft = `${indent * 20 + 12}px`;

    const icon = type === 'folder' ? '📁' : '📄';
    item.innerHTML = `${icon} ${name}`;

    container.appendChild(item);

    if (type === 'folder') {
      const folderContainer = document.createElement('div');
      folderContainer.style.display = 'block';
      container.appendChild(folderContainer);
      return folderContainer;
    }

    return item;
  }

  async createTape() {
    // Show creating screen
    this.goToCreatingStep();

    const config = {
      id: this.generateTapeId(),
      name: document.getElementById('tape-title').value,
      author: document.getElementById('tape-author').value,
      type: document.getElementById('tape-type').value,
      theme: document.getElementById('tape-theme').value,
      tags: document.getElementById('tape-tags').value.split(',').map(t => t.trim()),
      description: document.getElementById('tape-description').value,
      enableCline: document.getElementById('enable-cline').checked,
      enableKuhul: document.getElementById('enable-kuhul').checked
    };

    // Create tape from template
    try {
      this.updateStatus('Creating tape structure...');
      await this.sleep(500);

      const tapeConfig = this.templateMatcher.createTapeFromTemplate(
        this.selectedTemplate.id,
        config
      );

      this.updateStatus('Initializing brains...');
      await this.sleep(500);

      // Add Cline agent if enabled
      if (config.enableCline) {
        this.updateStatus('Integrating Cline AI assistant...');
        await this.sleep(500);

        tapeConfig.agents.push({
          id: 'cline',
          type: 'ai-agent',
          config: '/agents/cline-agent.json',
          status: 'ready'
        });
      }

      // Add KUHUL integration if enabled
      if (config.enableKuhul) {
        this.updateStatus('Setting up KUHUL multi-agent hive...');
        await this.sleep(500);

        tapeConfig.hive = {
          enabled: true,
          repo: 'https://github.com/cannaseedus-bot/KUHUL.git',
          agents: tapeConfig.agents.map(a => a.id)
        };
      }

      this.updateStatus('Generating files...');
      await this.sleep(500);

      // Save tape config
      this.createdTapeConfig = tapeConfig;

      this.updateStatus('Finalizing...');
      await this.sleep(500);

      // Show success
      this.goToSuccessStep(tapeConfig);

    } catch (error) {
      console.error('Error creating tape:', error);
      alert(`Error creating tape: ${error.message}`);
      this.goToStep(3);
    }
  }

  goToCreatingStep() {
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('active');
    });

    document.getElementById('creating-tape').classList.add('active');
  }

  updateStatus(message) {
    document.getElementById('creation-status').textContent = message;
  }

  goToSuccessStep(tapeConfig) {
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('active');
    });

    document.getElementById('tape-created').classList.add('active');
    document.getElementById('tape-id-display').textContent = `Tape ID: ${tapeConfig.id}`;
  }

  async openInStudio() {
    // Redirect to studio with tape loaded
    window.location.href = `/studio/studio-ui.html?tape=${this.createdTapeConfig.id}`;
  }

  reset() {
    this.selectedTemplate = null;
    this.currentStep = 1;
    this.createdTapeConfig = null;

    // Reset form
    document.getElementById('tape-title').value = '';
    document.getElementById('tape-author').value = 'Anonymous';
    document.getElementById('tape-tags').value = '';
    document.getElementById('tape-description').value = '';
    document.getElementById('enable-cline').checked = true;
    document.getElementById('enable-kuhul').checked = false;

    // Go back to step 1
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('active');
    });

    document.getElementById('template-selection').classList.add('active');

    // Reload templates
    this.loadTemplates();
  }

  close() {
    // Return to main arcade
    window.location.href = '/arcade/index.html';
  }

  generateTapeId() {
    const title = document.getElementById('tape-title').value;
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return `${slug}-${Date.now()}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  new CreateTapeUI();
});
