/**
 * 📊 DISAGREEMENT TRACKER
 *
 * Tracks and analyzes cases where judges disagree.
 * Helps identify edge cases, ambiguous situations, and judge biases.
 *
 * @author ASX Labs
 * @version 1.0.0
 */

class DisagreementTracker {
  constructor() {
    this.disagreements = [];
    this.patterns = new Map();
    this.judgeStats = new Map();
  }

  /**
   * Log a disagreement event
   */
  log(session) {
    const disagreement = {
      id: `disagree-${Date.now()}`,
      sessionId: session.id,
      timestamp: new Date().toISOString(),
      task: {
        type: session.task.type,
        contentHash: this.hashContent(session.task.content)
      },
      votes: session.votes.map(v => ({
        judge: v.judgeName,
        judgeId: v.judgeId,
        verdict: v.vote.verdict,
        confidence: v.vote.confidence,
        reasoning: v.vote.reasoning
      })),
      consensus: {
        verdict: session.consensus.verdict,
        confidence: session.consensus.confidence,
        agreementRate: session.consensus.agreementRate
      },
      severity: this.calculateSeverity(session)
    };

    this.disagreements.push(disagreement);
    this.analyzePattern(disagreement);
    this.updateJudgeStats(disagreement);

    // Persist to storage
    this.persist();

    return disagreement;
  }

  /**
   * Calculate disagreement severity
   * Higher severity = more significant disagreement
   */
  calculateSeverity(session) {
    const agreementRate = session.consensus.agreementRate / 100;
    const confidenceVariance = this.calculateConfidenceVariance(session.votes);

    // Severity factors:
    // 1. Low agreement rate = high severity
    // 2. High confidence variance = high severity
    const severityScore = (1 - agreementRate) * 0.6 + confidenceVariance * 0.4;

    if (severityScore > 0.7) return 'HIGH';
    if (severityScore > 0.4) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate variance in judge confidence levels
   */
  calculateConfidenceVariance(votes) {
    if (votes.length < 2) return 0;

    const confidences = votes.map(v => v.vote.confidence);
    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length;

    return Math.sqrt(variance);
  }

  /**
   * Analyze disagreement for patterns
   */
  analyzePattern(disagreement) {
    // Pattern 1: Task type disagreements
    const taskType = disagreement.task.type;
    if (!this.patterns.has(taskType)) {
      this.patterns.set(taskType, {
        type: taskType,
        count: 0,
        avgSeverity: 0,
        examples: []
      });
    }

    const pattern = this.patterns.get(taskType);
    pattern.count++;
    pattern.avgSeverity = (pattern.avgSeverity * (pattern.count - 1) +
                           this.severityToNumber(disagreement.severity)) / pattern.count;
    pattern.examples.push(disagreement.id);

    // Pattern 2: Judge pair disagreements
    for (let i = 0; i < disagreement.votes.length; i++) {
      for (let j = i + 1; j < disagreement.votes.length; j++) {
        const vote1 = disagreement.votes[i];
        const vote2 = disagreement.votes[j];

        if (vote1.verdict !== vote2.verdict) {
          const pairKey = [vote1.judgeId, vote2.judgeId].sort().join('-');
          if (!this.patterns.has(pairKey)) {
            this.patterns.set(pairKey, {
              type: 'judge-pair',
              judges: [vote1.judgeId, vote2.judgeId],
              disagreementCount: 0,
              examples: []
            });
          }

          const pairPattern = this.patterns.get(pairKey);
          pairPattern.disagreementCount++;
          pairPattern.examples.push(disagreement.id);
        }
      }
    }
  }

  /**
   * Update individual judge statistics
   */
  updateJudgeStats(disagreement) {
    const majorityVerdict = disagreement.consensus.verdict;

    for (const vote of disagreement.votes) {
      if (!this.judgeStats.has(vote.judgeId)) {
        this.judgeStats.set(vote.judgeId, {
          judgeId: vote.judgeId,
          judgeName: vote.judge,
          totalDisagreements: 0,
          withMajority: 0,
          againstMajority: 0,
          avgConfidenceWhenWrong: 0,
          avgConfidenceWhenRight: 0
        });
      }

      const stats = this.judgeStats.get(vote.judgeId);
      stats.totalDisagreements++;

      if (vote.verdict === majorityVerdict) {
        stats.withMajority++;
        stats.avgConfidenceWhenRight =
          (stats.avgConfidenceWhenRight * (stats.withMajority - 1) + vote.confidence) / stats.withMajority;
      } else {
        stats.againstMajority++;
        stats.avgConfidenceWhenWrong =
          (stats.avgConfidenceWhenWrong * (stats.againstMajority - 1) + vote.confidence) / stats.againstMajority;
      }
    }
  }

  /**
   * Get disagreement statistics
   */
  getStats() {
    const total = this.disagreements.length;
    if (total === 0) {
      return {
        total: 0,
        bySeverity: {},
        byTaskType: {},
        judgeStats: [],
        patterns: []
      };
    }

    // Count by severity
    const bySeverity = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };

    for (const d of this.disagreements) {
      bySeverity[d.severity]++;
    }

    // Count by task type
    const byTaskType = {};
    for (const d of this.disagreements) {
      byTaskType[d.task.type] = (byTaskType[d.task.type] || 0) + 1;
    }

    // Get top patterns
    const patterns = Array.from(this.patterns.values())
      .filter(p => p.type !== 'judge-pair')
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get judge pair disagreements
    const judgePairDisagreements = Array.from(this.patterns.values())
      .filter(p => p.type === 'judge-pair')
      .sort((a, b) => b.disagreementCount - a.disagreementCount);

    return {
      total: total,
      bySeverity: bySeverity,
      byTaskType: byTaskType,
      judgeStats: Array.from(this.judgeStats.values()),
      patterns: patterns,
      judgePairDisagreements: judgePairDisagreements,
      recentDisagreements: this.disagreements.slice(-10)
    };
  }

  /**
   * Get detailed analysis of a specific disagreement
   */
  analyze(disagreementId) {
    const disagreement = this.disagreements.find(d => d.id === disagreementId);
    if (!disagreement) {
      return { error: 'Disagreement not found' };
    }

    // Analyze the vote distribution
    const voteDistribution = {};
    for (const vote of disagreement.votes) {
      voteDistribution[vote.verdict] = (voteDistribution[vote.verdict] || 0) + 1;
    }

    // Find outliers (judges with very different confidence)
    const avgConfidence = disagreement.votes.reduce((sum, v) => sum + v.confidence, 0) / disagreement.votes.length;
    const outliers = disagreement.votes.filter(v =>
      Math.abs(v.confidence - avgConfidence) > 0.3
    );

    // Determine if this is a "split decision" or "weak consensus"
    const maxVotes = Math.max(...Object.values(voteDistribution));
    const decisionType = maxVotes === disagreement.votes.length
      ? 'unanimous'
      : maxVotes > disagreement.votes.length / 2
        ? 'weak-consensus'
        : 'split-decision';

    return {
      disagreement: disagreement,
      analysis: {
        voteDistribution: voteDistribution,
        decisionType: decisionType,
        avgConfidence: avgConfidence,
        outliers: outliers,
        recommendedAction: this.recommendAction(disagreement, decisionType)
      }
    };
  }

  /**
   * Recommend action based on disagreement analysis
   */
  recommendAction(disagreement, decisionType) {
    if (disagreement.severity === 'HIGH' && decisionType === 'split-decision') {
      return 'HUMAN_REVIEW_REQUIRED';
    }

    if (disagreement.task.type === 'security_audit' && disagreement.consensus.agreementRate < 75) {
      return 'HUMAN_REVIEW_RECOMMENDED';
    }

    if (decisionType === 'weak-consensus') {
      return 'ADDITIONAL_JUDGE_SUGGESTED';
    }

    return 'LOG_AND_PROCEED';
  }

  /**
   * Convert severity to number for calculations
   */
  severityToNumber(severity) {
    const map = { LOW: 1, MEDIUM: 2, HIGH: 3 };
    return map[severity] || 1;
  }

  /**
   * Simple hash for content (for pattern matching)
   */
  hashContent(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Persist disagreements to storage
   */
  persist() {
    try {
      localStorage.setItem('tribunal-disagreements', JSON.stringify({
        disagreements: this.disagreements.slice(-100), // Keep last 100
        patterns: Array.from(this.patterns.entries()),
        judgeStats: Array.from(this.judgeStats.entries()),
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to persist disagreements:', error);
    }
  }

  /**
   * Load disagreements from storage
   */
  load() {
    try {
      const data = localStorage.getItem('tribunal-disagreements');
      if (data) {
        const parsed = JSON.parse(data);
        this.disagreements = parsed.disagreements || [];
        this.patterns = new Map(parsed.patterns || []);
        this.judgeStats = new Map(parsed.judgeStats || []);
        console.log(`📊 Loaded ${this.disagreements.length} disagreements from storage`);
      }
    } catch (error) {
      console.error('Failed to load disagreements:', error);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DisagreementTracker;
}
