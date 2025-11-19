/**
 * ROMBOS CODER QWEN 7B - FRONTEND
 * ASX Tape UI for code analysis
 */

let statusIndicator;
let statsDisplay;
let logsContainer;

// Initialize
window.addEventListener('DOMContentLoaded', async () => {
  statusIndicator = document.getElementById('status');
  statsDisplay = document.getElementById('stats');
  logsContainer = document.getElementById('logs');

  await checkStatus();
  log('System initialized', 'info');
});

/**
 * Check LLM backend status
 */
async function checkStatus() {
  try {
    const res = await fetch('/api/rombos/status');
    const json = await res.json();

    if (json.status === 'online') {
      setStatus('online', '⬤ Online');
      log(`Backend online: ${json.model}`, 'success');
    } else {
      setStatus('offline', '⬤ Offline');
      log('Backend offline - start Ollama/llama.cpp', 'error');
    }
  } catch (err) {
    setStatus('error', '⬤ Error');
    log(`Connection failed: ${err.message}`, 'error');
  }
}

/**
 * Analyze code with Rombos
 */
async function analyzeCode() {
  const input = document.getElementById('codeInput').value.trim();
  const taskType = document.getElementById('taskType').value;
  const output = document.getElementById('output');
  const btn = document.getElementById('analyzeBtn');

  if (!input) {
    log('No code provided', 'warning');
    return;
  }

  // Disable button
  btn.disabled = true;
  btn.textContent = 'Analyzing...';

  output.innerHTML = '<div class="loading">⏳ Analyzing code with Rombos...</div>';

  log(`Started ${taskType} analysis`, 'info');

  const startTime = Date.now();

  try {
    const res = await fetch('/api/rombos/infer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: input,
        system: getSystemPrompt(taskType),
        options: {
          temperature: 0.2,
          top_p: 0.9,
          num_predict: 768
        }
      })
    });

    const json = await res.json();
    const duration = Date.now() - startTime;

    if (!json.ok) {
      throw new Error(json.error || 'Unknown error');
    }

    // Display result
    output.innerHTML = `
      <div class="result-header">
        <strong>Task:</strong> ${taskType}
      </div>
      <pre class="result-text">${escapeHtml(json.output)}</pre>
    `;

    // Update stats
    statsDisplay.innerHTML = `
      <span>⏱️ ${duration}ms</span>
      ${json.tokens ? `<span>🔢 ${json.tokens} tokens</span>` : ''}
    `;

    log(`Analysis complete (${duration}ms)`, 'success');

  } catch (err) {
    output.innerHTML = `<div class="error">❌ Error: ${escapeHtml(err.message)}</div>`;
    log(`Analysis failed: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Analyze Code';
  }
}

/**
 * Get system prompt for task type
 */
function getSystemPrompt(taskType) {
  const prompts = {
    code_review: 'You are a code review expert. Analyze the code and provide: 1) Overall assessment 2) Issues found 3) Suggestions 4) Confidence level.',
    bug_analysis: 'You are a bug detection specialist. Find and analyze bugs: 1) Severity 2) List of bugs 3) Root causes 4) Fixes 5) Confidence level.',
    optimization: 'You are a performance optimization expert. Evaluate: 1) Performance rating 2) Bottlenecks 3) Optimization suggestions 4) Expected improvements.',
    security_audit: 'You are a security auditor. Perform security audit: 1) Security rating 2) Vulnerabilities 3) Best practice violations 4) Remediation steps.',
    general: 'You are a helpful coding assistant. Analyze the code and provide clear, actionable feedback.'
  };

  return prompts[taskType] || prompts.general;
}

/**
 * Set status indicator
 */
function setStatus(state, text) {
  statusIndicator.className = `status status-${state}`;
  statusIndicator.textContent = text;
}

/**
 * Log message
 */
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  entry.innerHTML = `<span class="log-time">[${timestamp}]</span> ${escapeHtml(message)}`;

  logsContainer.insertBefore(entry, logsContainer.firstChild);

  // Keep only last 50 logs
  while (logsContainer.children.length > 50) {
    logsContainer.removeChild(logsContainer.lastChild);
  }
}

/**
 * Clear input
 */
function clearInput() {
  document.getElementById('codeInput').value = '';
  document.getElementById('output').innerHTML = '';
  statsDisplay.innerHTML = '';
  log('Input cleared', 'info');
}

/**
 * Clear logs
 */
function clearLogs() {
  logsContainer.innerHTML = '';
  log('Logs cleared', 'info');
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
