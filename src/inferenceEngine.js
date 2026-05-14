import KNOWLEDGE_BASE from './knowledgeBase';
import NLPEngine from './nlpEngine';

const InferenceEngine = {
  evaluateCondition(fact_val, operator, rule_val) {
    if (fact_val === undefined || fact_val === null) return false;
    switch(operator) {
      case ">=": return fact_val >= rule_val;
      case "<=": return fact_val <= rule_val;
      case ">":  return fact_val > rule_val;
      case "<":  return fact_val < rule_val;
      case "==": return fact_val === rule_val;
      case "!=": return fact_val !== rule_val;
      default: return false;
    }
  },

  evaluateRule(rule, facts) {
    if (rule.conditions.length === 0) return true;
    return rule.conditions.every(cond =>
      this.evaluateCondition(facts[cond.field], cond.op, cond.val)
    );
  },

  forwardChain(facts, category = null, limit = 5) {
    const fired = [];
    const sorted = [...KNOWLEDGE_BASE.rules]
      .filter(r => !category || r.category === category)
      .sort((a,b) => {
        // Prioritize rules with more conditions (more specific)
        const condDiff = b.conditions.length - a.conditions.length;
        if (condDiff !== 0) return condDiff;
        return a.priority - b.priority;
      });

    for (const rule of sorted) {
      if (this.evaluateRule(rule, facts)) {
        // Calculate relevance score based on how many facts are used
        const relevanceScore = rule.conditions.length > 0 
          ? rule.conditions.filter(c => facts[c.field] !== undefined).length / rule.conditions.length
          : 0.1; // Low score for rules without conditions
        
        fired.push({
          rule,
          relevanceScore,
          matched_conditions: rule.conditions.map(c => ({
            field: c.field,
            actual: facts[c.field],
            operator: c.op,
            expected: c.val,
            passed: this.evaluateCondition(facts[c.field], c.op, c.val)
          }))
        });
        if (fired.length >= limit) break;
      }
    }
    
    // Sort by relevance score (higher is better)
    return fired.sort((a, b) => b.relevanceScore - a.relevanceScore);
  },

  infer(userInput) {
    const { intent, confidence } = NLPEngine.detectIntent(userInput);
    const facts = NLPEngine.extractFacts(userInput);
    const trace = [];

    trace.push({ step: "NLP", data: { intent: intent?.id, confidence: Math.round(confidence*100), facts } });

    let fired = [];
    if (intent) {
      fired = this.forwardChain(facts, intent.category);
      // Only fallback to global lookup when we truly have no matched category rules.
      if (fired.length === 0) fired = this.forwardChain(facts, null, 3);
    } else {
      // General knowledge lookup
      fired = this.forwardChain(facts, null, 5);
    }

    trace.push({ step: "ForwardChaining", data: { rules_fired: fired.map(f => f.rule.rule_id), total: fired.length } });

    return { intent, confidence, facts, fired, trace };
  }
};

export default InferenceEngine;
