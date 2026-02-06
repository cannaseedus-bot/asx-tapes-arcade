# 🏛️ Cline v10 Multi-Judge Tribunal System

**Consensus AI Evaluation with Multiple Judges**

The Multi-Judge Tribunal is an advanced consensus-based AI evaluation system that combines the judgments of multiple AI models to produce more reliable, balanced, and trustworthy code reviews, bug analyses, and security audits.

---

## 🎯 Overview

Instead of relying on a single AI model, the Tribunal convenes **three judges**:

1. **Cline** (Claude Sonnet 4.5) - Deep code understanding, security awareness
2. **Qwen** - Fast evaluation, pattern matching
3. **MX2LM** - Deep reasoning, algorithm analysis

Each judge independently evaluates the same code, then the system calculates consensus, tracks disagreements, and produces a final verdict with confidence scoring.

---

## ✨ Key Features

### 1. **Multi-Judge Consensus**
- Parallel evaluation by 3+ AI judges
- Weighted voting based on expertise
- Confidence-based aggregation
- Unanimous vs split decisions

### 2. **Disagreement Tracking**
- Logs when judges disagree
- Identifies patterns in disagreements
- Tracks judge accuracy over time
- Auto-escalation to human review

### 3. **Confidence Scoring**
- Each judge provides confidence (0-1)
- Consensus confidence calculated from:
  - Agreement rate (60%)
  - Average individual confidence (40%)
- Threshold-based escalation

### 4. **Intelligent Routing**
- Task-specific judge selection
- Optional vs required judges
- Fallback strategies
- Load balancing

### 5. **Audit Trail**
- Complete session logs
- Individual vote records
- Disagreement analytics
- Judge performance metrics

---

## 📁 File Structure

```
/agents/multi-judge/
  tribunal.js              ← Core tribunal orchestration
  judges.json              ← Judge configurations
  disagreement-tracker.js  ← Disagreement logging & analysis
  tribunal-ui.html         ← Web UI for tribunal
  README.md                ← This file
  logs/                    ← Session logs (auto-generated)
```

---

## 🚀 Quick Start

### 1. Open the Tribunal UI

```bash
# Navigate to:
http://localhost/asx-tapes-arcade/agents/multi-judge/tribunal-ui.html
```

### 2. Submit Code for Review

```javascript
// Example: Code Review
Task Type: code_review
Code:
  function authenticate(user, pass) {
    if (user == "admin" && pass == "password123") {
      return true;
    }
    return false;
  }

Context: Login function for admin portal
```

### 3. Review Tribunal Decision

The tribunal will:
- ✅ Submit code to all 3 judges
- ✅ Collect individual verdicts
- ✅ Calculate consensus
- ✅ Display results with confidence

**Example Output:**
```
🏛️ Tribunal Decision: REQUEST_CHANGES
   Confidence: 87%
   Agreement: 100% (Unanimous)

   Cline: REQUEST_CHANGES (95% confident)
   Qwen: REQUEST_CHANGES (85% confident)
   MX2LM: REQUEST_CHANGES (82% confident)

   Issues:
   - Use of == instead of === (security risk)
   - Hardcoded credentials
   - No password hashing
   - Missing input validation
```

---

## 🔧 Programmatic Usage

### JavaScript API

```javascript
// Initialize tribunal
const tribunal = new Tribunal();

// Submit task for evaluation
const session = await tribunal.evaluate({
  type: 'code_review',
  content: `
    function processPayment(amount) {
      return fetch('/api/pay', {
        method: 'POST',
        body: JSON.stringify({ amount })
      });
    }
  `,
  context: {
    framework: 'vanilla-js',
    security_level: 'high'
  }
});

// Access consensus
console.log(session.consensus.verdict);      // "REQUEST_CHANGES"
console.log(session.consensus.confidence);   // 0.87
console.log(session.consensus.agreementRate); // 100

// Access individual votes
for (const vote of session.votes) {
  console.log(`${vote.judgeName}: ${vote.vote.verdict}`);
}

// Check for disagreement
if (session.consensus.hasDisagreement) {
  console.warn('Judges disagree - human review recommended');
}
```

### GHOST API Endpoint

```bash
# Submit via REST API
curl -X POST http://localhost/ghost/swarm/route \
  -H "Content-Type: application/json" \
  -d '{
    "task": "code_review",
    "payload": {
      "content": "function foo() { ... }",
      "context": {}
    }
  }'
```

---

## 📊 Task Types

### 1. Code Review
**Judges:** Cline (required), Qwen (required), MX2LM (optional)

**Verdicts:**
- `APPROVE` - Code is good, ready to merge
- `REQUEST_CHANGES` - Issues found, changes needed
- `REJECT` - Critical problems, do not merge

**Use Case:** Pull request reviews, code quality checks

---

### 2. Bug Analysis
**Judges:** Cline (required), Qwen (optional), MX2LM (optional)

**Verdicts:**
- `CRITICAL` - Severe bugs (crashes, data loss, security)
- `HIGH` - Major bugs (broken features, logic errors)
- `MEDIUM` - Moderate bugs (edge cases, minor issues)
- `LOW` - Minor bugs (cosmetic, non-critical)
- `NONE` - No bugs found

**Use Case:** Bug hunting, pre-release checks

---

### 3. Optimization Review
**Judges:** MX2LM (required), Cline (required), Qwen (optional)

**Verdicts:**
- `EXCELLENT` - Optimal performance
- `GOOD` - Solid performance, minor improvements possible
- `FAIR` - Acceptable but has bottlenecks
- `POOR` - Major performance issues

**Use Case:** Performance optimization, algorithm review

---

### 4. Security Audit
**Judges:** Cline (required), MX2LM (required), Qwen (optional)

**Verdicts:**
- `SECURE` - No security issues
- `MINOR_ISSUES` - Low-risk vulnerabilities
- `MAJOR_ISSUES` - High-risk vulnerabilities
- `CRITICAL` - Exploitable security flaws

**Use Case:** Security reviews, penetration testing prep

---

## 🎯 Consensus Rules

### Voting Weights
- **Cline:** 1.5x (general expertise)
- **Qwen:** 1.0x (fast evaluation)
- **MX2LM:** 1.2x (reasoning specialist)

### Confidence Calculation
```javascript
consensusConfidence = (avgJudgeConfidence × 0.6) + (agreementRate × 0.4)
```

Example:
- 3 judges vote, 2 agree (67% agreement)
- Average judge confidence: 0.85
- Consensus confidence: (0.85 × 0.6) + (0.67 × 0.4) = **0.778** (78%)

### Escalation Rules

| Scenario | Action |
|----------|--------|
| Agreement < 50% | `FLAG_FOR_REVIEW` |
| Security audit + agreement < 75% | `HUMAN_REVIEW_RECOMMENDED` |
| Critical split decision | `REQUIRE_HUMAN` |
| Confidence < 0.3 | `INSUFFICIENT_CONFIDENCE` |

---

## 📈 Disagreement Tracking

The system automatically tracks when judges disagree to:
- Identify problematic code patterns
- Detect judge biases
- Improve future consensus
- Provide audit trails

### Example Disagreement Log

```json
{
  "id": "disagree-1234567890",
  "sessionId": "tribunal-xyz",
  "timestamp": "2025-01-19T12:30:00Z",
  "severity": "HIGH",
  "votes": [
    {
      "judge": "Cline",
      "verdict": "REJECT",
      "confidence": 0.95
    },
    {
      "judge": "Qwen",
      "verdict": "APPROVE",
      "confidence": 0.60
    },
    {
      "judge": "MX2LM",
      "verdict": "REQUEST_CHANGES",
      "confidence": 0.80
    }
  ],
  "consensus": {
    "verdict": "REJECT",
    "confidence": 0.72,
    "agreementRate": 33
  },
  "recommendedAction": "HUMAN_REVIEW_REQUIRED"
}
```

---

## 🔍 Statistics & Analytics

### Judge Performance Metrics

```javascript
const stats = tribunal.getStats();

// Example output:
{
  judges: [
    {
      id: "cline",
      name: "Cline (Claude Sonnet 4.5)",
      status: "online",
      totalVotes: 127,
      agreements: 115,
      disagreements: 12,
      agreementRate: 91  // 91% of the time agrees with majority
    },
    // ...
  ],
  totalSessions: 127,
  totalDisagreements: 23
}
```

### Disagreement Analytics

```javascript
const disagreeStats = disagreementTracker.getStats();

// Example output:
{
  total: 23,
  bySeverity: {
    HIGH: 3,
    MEDIUM: 12,
    LOW: 8
  },
  byTaskType: {
    code_review: 15,
    security_audit: 5,
    bug_analysis: 3
  }
}
```

---

## ⚙️ Configuration

### Modify Judge Endpoints

Edit `/agents/multi-judge/judges.json`:

```json
{
  "judges": {
    "cline": {
      "endpoint": "http://127.0.0.1:9999/run",
      "timeoutMs": 30000
    },
    "qwen": {
      "endpoint": "http://127.0.0.1:5001/chat",
      "timeoutMs": 10000
    },
    "mx2lm": {
      "endpoint": "http://127.0.0.1:9988/infer",
      "timeoutMs": 20000
    }
  }
}
```

### Adjust Consensus Thresholds

```json
{
  "consensusRules": {
    "majorityThreshold": 0.51,      // 51% required for majority
    "confidenceWeighting": true,    // Weight by confidence
    "expertiseWeighting": true,     // Weight by judge expertise
    "minConfidence": 0.3            // Minimum acceptable confidence
  }
}
```

---

## 🔌 Integration with Studio

The Multi-Judge Tribunal integrates seamlessly with the ASX Studio system:

### From Studio Code Editor

```javascript
// In /studio/studio-system.js
async function reviewCodeWithTribunal(code) {
  const tribunal = new Tribunal();

  const session = await tribunal.evaluate({
    type: 'code_review',
    content: code,
    context: {
      tapeId: currentTape.id,
      file: currentFile
    }
  });

  // Display results in studio UI
  displayTribunalResults(session);
}
```

### From Cline Agent

```javascript
// Cline can invoke tribunal for critical decisions
if (task.requiresConsensus) {
  const tribunalDecision = await ghostProxy.post('/ghost/swarm/route', {
    task: 'security_audit',
    payload: { content: generatedCode }
  });

  if (tribunalDecision.consensus.confidence < 0.7) {
    // Request human review
    escalateToHuman(tribunalDecision);
  }
}
```

---

## 🧪 Testing

### Run Test Evaluation

```javascript
// Test the tribunal with sample code
const testCode = `
function login(username, password) {
  if (username && password) {
    return db.query('SELECT * FROM users WHERE name=' + username);
  }
}
`;

const session = await tribunal.evaluate({
  type: 'security_audit',
  content: testCode
});

console.assert(session.consensus.verdict === 'CRITICAL');
console.assert(session.consensus.hasDisagreement === false);
```

### Expected Result

```
🏛️ Tribunal Session Started
   👥 3 judges available

   ⚖️ Asking Cline...
      Cline: CRITICAL (98% confident)

   ⚖️ Asking Qwen...
      Qwen: CRITICAL (92% confident)

   ⚖️ Asking MX2LM...
      MX2LM: CRITICAL (95% confident)

   🎯 Tribunal Decision:
      Verdict: CRITICAL
      Confidence: 96.3%
      Agreement: 100%
      Duration: 2341ms

   ✓ Unanimous Decision

   Issues Found:
   - SQL Injection vulnerability (CRITICAL)
   - No input sanitization
   - Direct string concatenation in query
```

---

## 📝 Example Use Cases

### 1. Pre-Commit Code Review

```javascript
// Git pre-commit hook integration
async function preCommitReview(changedFiles) {
  for (const file of changedFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    const session = await tribunal.evaluate({
      type: 'code_review',
      content: content,
      context: { file: file }
    });

    if (session.consensus.verdict === 'REJECT') {
      console.error(`❌ Commit blocked: ${file}`);
      console.error(`   Reason: ${session.consensus.verdict}`);
      process.exit(1);
    }
  }
}
```

### 2. Security Audit Pipeline

```javascript
// CI/CD security check
async function securityPipeline(codebase) {
  const criticalFiles = findCriticalFiles(codebase);
  const results = [];

  for (const file of criticalFiles) {
    const session = await tribunal.evaluate({
      type: 'security_audit',
      content: file.content,
      context: { file: file.path, critical: true }
    });

    results.push({
      file: file.path,
      verdict: session.consensus.verdict,
      confidence: session.consensus.confidence
    });
  }

  // Fail build if any CRITICAL or MAJOR_ISSUES found
  const failures = results.filter(r =>
    r.verdict === 'CRITICAL' || r.verdict === 'MAJOR_ISSUES'
  );

  if (failures.length > 0) {
    throw new Error(`Security audit failed: ${failures.length} files`);
  }
}
```

### 3. Bug Bounty Analysis

```javascript
// Analyze suspected bug reports
async function analyzeBugReport(report) {
  const session = await tribunal.evaluate({
    type: 'bug_analysis',
    content: report.code,
    context: {
      reporter: report.submitter,
      claimed_severity: report.severity,
      reproduction: report.steps
    }
  });

  // Compare tribunal verdict with claimed severity
  if (session.consensus.verdict !== report.severity) {
    console.warn(`⚠️ Severity mismatch detected`);
    console.warn(`   Claimed: ${report.severity}`);
    console.warn(`   Tribunal: ${session.consensus.verdict}`);
  }

  return {
    validated: session.consensus.verdict !== 'NONE',
    actualSeverity: session.consensus.verdict,
    confidence: session.consensus.confidence
  };
}
```

---

## 🎓 Best Practices

### 1. **Always Include Context**
```javascript
// ❌ Bad
tribunal.evaluate({ type: 'code_review', content: code });

// ✅ Good
tribunal.evaluate({
  type: 'code_review',
  content: code,
  context: {
    framework: 'react',
    security_level: 'high',
    performance_critical: true
  }
});
```

### 2. **Respect Confidence Thresholds**
```javascript
if (session.consensus.confidence < 0.6) {
  // Low confidence - get human review
  escalateToHuman(session);
} else if (session.consensus.confidence < 0.8) {
  // Medium confidence - flag for review
  flagForReview(session);
} else {
  // High confidence - proceed
  applyDecision(session);
}
```

### 3. **Monitor Disagreements**
```javascript
// Regularly check disagreement patterns
const stats = disagreementTracker.getStats();

if (stats.bySeverity.HIGH > 10) {
  console.warn('High number of severe disagreements - review judge configs');
}
```

### 4. **Use Task-Specific Evaluations**
```javascript
// Use appropriate task type
const taskTypes = {
  'before_merge': 'code_review',
  'security_check': 'security_audit',
  'performance': 'optimization',
  'bug_report': 'bug_analysis'
};

const session = await tribunal.evaluate({
  type: taskTypes[currentPhase],
  content: code
});
```

---

## 🔒 Security Considerations

1. **Judge Endpoint Security**
   - All judges run on localhost by default
   - No external API calls
   - Configurable timeouts prevent hanging

2. **Data Privacy**
   - Code never leaves local network
   - No cloud API dependencies
   - All processing local

3. **Audit Trail**
   - Every decision logged
   - Complete vote records
   - Disagreement tracking

---

## 🚧 Limitations

1. **Judge Availability**
   - Requires at least 2 judges online
   - Falls back gracefully if judge unavailable
   - No consensus possible with 0 judges

2. **Response Time**
   - Slower than single-judge evaluation
   - Parallel execution helps (typically 2-5 seconds)
   - Configurable timeouts per judge

3. **Resource Usage**
   - Runs 3 AI models simultaneously
   - Requires adequate RAM/GPU
   - CPU/GPU usage spikes during evaluation

---

## 📚 API Reference

### Tribunal Class

#### `constructor(ghostProxy)`
Initialize tribunal with GHOST proxy for agent communication.

#### `evaluate(task) → Promise<Session>`
Submit task for tribunal evaluation.

**Parameters:**
- `task.type` - Task type (code_review, bug_analysis, etc.)
- `task.content` - Code or content to evaluate
- `task.context` - Additional context object

**Returns:** Session object with consensus

#### `getStats() → Object`
Get tribunal statistics (sessions, disagreements, judge performance).

#### `pingJudges() → Promise<void>`
Check which judges are online.

---

### DisagreementTracker Class

#### `log(session) → Disagreement`
Log a disagreement event.

#### `getStats() → Object`
Get disagreement statistics.

#### `analyze(disagreementId) → Analysis`
Get detailed analysis of specific disagreement.

---

## 🤝 Contributing

To add a new judge:

1. Add endpoint to `judges.json`
2. Define skills and strengths
3. Set voting weight
4. Configure timeout
5. Test with sample evaluations

To add a new task type:

1. Add to `taskTypes` in `judges.json`
2. Define required/optional judges
3. Specify possible verdicts
4. Create prompt template in `tribunal.js`

---

## 📄 License

Part of the ASX Tapes Arcade project.

---

**Built with ⟁ by ASX Labs**

*"In code we trust, but in consensus we verify."*
