/**
 * 🏛️ CLINE V10 MULTI-JUDGE TRIBUNAL SYSTEM
 *
 * Orchestrates consensus evaluation across multiple AI judges:
 * - Cline (Claude Sonnet 4.5) - Code generation and analysis
 * - Qwen - Fast evaluation and judgment
 * - MX2LM - Deep reasoning and analysis
 *
 * @author ASX Labs
 * @version 10.0.0
 */

class Tribunal {
  constructor(ghostProxy) {
    this.ghostProxy = ghostProxy; // GHOST proxy for agent communication
    this.judges = new Map();
    this.sessions = new Map();
    this.disagreementLog = [];

    this.loadJudges();
  }

  /**
   * Load judge configurations
   */
  async loadJudges() {
    const response = await fetch('/agents/multi-judge/judges.json');
    const config = await response.json();

    for (const [id, judge] of Object.entries(config.judges)) {
      this.judges.set(id, {
        ...judge,
        status: 'offline',
        totalVotes: 0,
        agreements: 0,
        disagreements: 0
      });
    }

    // Ping all judges to check availability
    await this.pingJudges();
  }

  /**
   * Check which judges are online
   */
  async pingJudges() {
    for (const [id, judge] of this.judges) {
      try {
        const response = await fetch(`/ghost/proxy-external/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ping',
            timeout: 2000
          })
        });

        if (response.ok) {
          judge.status = 'online';
          console.log(`✅ Judge ${id} is online`);
        } else {
          judge.status = 'offline';
          console.warn(`⚠️ Judge ${id} is offline`);
        }
      } catch (error) {
        judge.status = 'offline';
        console.error(`❌ Judge ${id} failed: ${error.message}`);
      }
    }
  }

  /**
   * Submit a task for tribunal evaluation
   *
   * @param {Object} task - Task to evaluate
   * @param {string} task.type - 'code_review', 'bug_analysis', 'optimization', etc.
   * @param {string} task.content - Code or content to evaluate
   * @param {Object} task.context - Additional context
   * @returns {Object} Tribunal decision with consensus
   */
  async evaluate(task) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      task: task,
      startTime: Date.now(),
      judges: [],
      votes: [],
      consensus: null,
      disagreements: [],
      confidence: 0
    };

    this.sessions.set(sessionId, session);

    console.log(`🏛️ Tribunal Session ${sessionId} started`);
    console.log(`📋 Task: ${task.type}`);

    // Get votes from all online judges in parallel
    const onlineJudges = Array.from(this.judges.entries())
      .filter(([_, judge]) => judge.status === 'online');

    if (onlineJudges.length === 0) {
      throw new Error('No judges are online. Cannot form tribunal.');
    }

    console.log(`👥 ${onlineJudges.length} judges available`);

    // Collect votes from all judges
    const votePromises = onlineJudges.map(([id, judge]) =>
      this.collectVote(id, judge, task, sessionId)
    );

    const votes = await Promise.allSettled(votePromises);

    // Process successful votes
    for (let i = 0; i < votes.length; i++) {
      const result = votes[i];
      const [judgeId, judge] = onlineJudges[i];

      if (result.status === 'fulfilled') {
        session.votes.push({
          judgeId: judgeId,
          judgeName: judge.name,
          vote: result.value,
          timestamp: Date.now()
        });
        judge.totalVotes++;
      } else {
        console.error(`❌ ${judgeId} failed to vote:`, result.reason);
      }
    }

    // Calculate consensus
    const consensus = this.calculateConsensus(session.votes);
    session.consensus = consensus;
    session.confidence = consensus.confidence;
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    // Track disagreements
    if (consensus.hasDisagreement) {
      this.trackDisagreement(session);
    }

    // Update judge statistics
    this.updateJudgeStats(session);

    console.log(`\n🎯 Tribunal Decision:`);
    console.log(`   Verdict: ${consensus.verdict}`);
    console.log(`   Confidence: ${(consensus.confidence * 100).toFixed(1)}%`);
    console.log(`   Agreement: ${consensus.agreementRate}%`);
    console.log(`   Duration: ${session.duration}ms\n`);

    return session;
  }

  /**
   * Collect vote from a single judge
   */
  async collectVote(judgeId, judge, task, sessionId) {
    console.log(`⚖️  Asking ${judge.name}...`);

    const payload = {
      action: 'evaluate',
      sessionId: sessionId,
      task: {
        type: task.type,
        content: task.content,
        context: task.context || {}
      },
      prompt: this.buildPrompt(task, judge)
    };

    const response = await fetch(`/ghost/proxy-external/${judgeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    // Parse the vote
    const vote = this.parseVote(result, judge);

    console.log(`   ${judge.name}: ${vote.verdict} (confidence: ${(vote.confidence * 100).toFixed(1)}%)`);

    return vote;
  }

  /**
   * Build evaluation prompt for a judge
   */
  buildPrompt(task, judge) {
    const basePrompt = {
      'code_review': `Review this code and provide:
1. Overall assessment (APPROVE, REQUEST_CHANGES, REJECT)
2. Issues found (bugs, style, performance, security)
3. Suggestions for improvement
4. Confidence level (0-1)

Code:
${task.content}`,

      'bug_analysis': `Analyze this code for bugs and provide:
1. Bug severity (CRITICAL, HIGH, MEDIUM, LOW, NONE)
2. List of bugs found
3. Root cause analysis
4. Recommended fixes
5. Confidence level (0-1)

Code:
${task.content}`,

      'optimization': `Evaluate this code for optimization opportunities:
1. Performance rating (EXCELLENT, GOOD, FAIR, POOR)
2. Bottlenecks identified
3. Optimization suggestions
4. Expected improvement
5. Confidence level (0-1)

Code:
${task.content}`,

      'security_audit': `Perform security audit on this code:
1. Security rating (SECURE, MINOR_ISSUES, MAJOR_ISSUES, CRITICAL)
2. Vulnerabilities found
3. Security best practices violations
4. Remediation steps
5. Confidence level (0-1)

Code:
${task.content}`
    };

    return basePrompt[task.type] || `Evaluate: ${task.content}`;
  }

  /**
   * Parse judge response into standardized vote
   */
  parseVote(response, judge) {
    // Try to extract structured vote from response
    const vote = {
      verdict: 'UNKNOWN',
      confidence: 0.5,
      reasoning: '',
      details: {},
      raw: response
    };

    // Extract verdict (look for keywords)
    const verdictPatterns = {
      'APPROVE': /\b(approve|approved|looks good|lgtm|accept)\b/i,
      'REQUEST_CHANGES': /\b(request changes|needs work|improvements needed)\b/i,
      'REJECT': /\b(reject|rejected|bad|critical issues)\b/i,
      'CRITICAL': /\b(critical|severe|dangerous)\b/i,
      'HIGH': /\b(high|major|serious)\b/i,
      'MEDIUM': /\b(medium|moderate)\b/i,
      'LOW': /\b(low|minor|trivial)\b/i,
      'EXCELLENT': /\b(excellent|optimal|perfect)\b/i,
      'GOOD': /\b(good|solid|well-written)\b/i,
      'FAIR': /\b(fair|acceptable|okay)\b/i,
      'POOR': /\b(poor|bad|inefficient)\b/i
    };

    const text = JSON.stringify(response).toLowerCase();
    for (const [verdict, pattern] of Object.entries(verdictPatterns)) {
      if (pattern.test(text)) {
        vote.verdict = verdict;
        break;
      }
    }

    // Extract confidence (0.0-1.0)
    const confidenceMatch = text.match(/confidence[:\s]+([0-9.]+)/i);
    if (confidenceMatch) {
      vote.confidence = parseFloat(confidenceMatch[1]);
      if (vote.confidence > 1) vote.confidence = vote.confidence / 100;
    }

    // Store full response as reasoning
    vote.reasoning = response.output || response.message || JSON.stringify(response);

    return vote;
  }

  /**
   * Calculate consensus from all votes
   */
  calculateConsensus(votes) {
    if (votes.length === 0) {
      return {
        verdict: 'NO_QUORUM',
        confidence: 0,
        agreementRate: 0,
        hasDisagreement: false,
        votes: []
      };
    }

    // Count verdicts
    const verdictCounts = {};
    let totalConfidence = 0;

    for (const vote of votes) {
      verdictCounts[vote.vote.verdict] = (verdictCounts[vote.vote.verdict] || 0) + 1;
      totalConfidence += vote.vote.confidence;
    }

    // Find majority verdict
    const sortedVerdicts = Object.entries(verdictCounts)
      .sort((a, b) => b[1] - a[1]);

    const majorityVerdict = sortedVerdicts[0][0];
    const majorityCount = sortedVerdicts[0][1];
    const agreementRate = Math.round((majorityCount / votes.length) * 100);

    // Check for unanimous vs split decision
    const hasDisagreement = sortedVerdicts.length > 1;

    // Calculate consensus confidence
    // Higher confidence when:
    // 1. More judges agree (agreementRate)
    // 2. Individual judges are confident (avgConfidence)
    const avgConfidence = totalConfidence / votes.length;
    const agreementFactor = agreementRate / 100;
    const consensusConfidence = (avgConfidence * 0.6) + (agreementFactor * 0.4);

    return {
      verdict: majorityVerdict,
      confidence: consensusConfidence,
      agreementRate: agreementRate,
      hasDisagreement: hasDisagreement,
      votes: votes,
      distribution: verdictCounts,
      unanimousDecision: agreementRate === 100
    };
  }

  /**
   * Track disagreement for analysis
   */
  trackDisagreement(session) {
    const disagreement = {
      sessionId: session.id,
      timestamp: Date.now(),
      task: session.task.type,
      votes: session.votes.map(v => ({
        judge: v.judgeName,
        verdict: v.vote.verdict,
        confidence: v.vote.confidence
      })),
      consensus: session.consensus.verdict,
      agreementRate: session.consensus.agreementRate
    };

    this.disagreementLog.push(disagreement);

    // Keep only last 100 disagreements
    if (this.disagreementLog.length > 100) {
      this.disagreementLog.shift();
    }

    console.log(`⚠️  Disagreement logged (${session.consensus.agreementRate}% agreement)`);
  }

  /**
   * Update judge statistics after session
   */
  updateJudgeStats(session) {
    const majorityVerdict = session.consensus.verdict;

    for (const vote of session.votes) {
      const judge = this.judges.get(vote.judgeId);
      if (!judge) continue;

      if (vote.vote.verdict === majorityVerdict) {
        judge.agreements++;
      } else {
        judge.disagreements++;
      }
    }
  }

  /**
   * Get tribunal statistics
   */
  getStats() {
    const judges = Array.from(this.judges.entries()).map(([id, judge]) => ({
      id: id,
      name: judge.name,
      status: judge.status,
      totalVotes: judge.totalVotes,
      agreements: judge.agreements,
      disagreements: judge.disagreements,
      agreementRate: judge.totalVotes > 0
        ? Math.round((judge.agreements / judge.totalVotes) * 100)
        : 0
    }));

    return {
      judges: judges,
      totalSessions: this.sessions.size,
      totalDisagreements: this.disagreementLog.length,
      recentDisagreements: this.disagreementLog.slice(-10)
    };
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `tribunal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Tribunal;
}
