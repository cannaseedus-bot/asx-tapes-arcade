/**
 * XJSON (eXtended JSON) Runtime Engine
 * Extended JSON format with control flow, logic blocks, and K'uhul integration
 *
 * Features:
 * - Control flow (@if, @then, @else, @while, @for)
 * - Logic blocks with K'uhul execution
 * - Variable substitution
 * - Dynamic evaluation
 * - AST processing
 */

class XJSONRuntime {
  constructor(kuhulInterpreter) {
    this.interpreter = kuhulInterpreter;
    this.variables = {};
    this.functions = {};
  }

  /**
   * Parse XJSON string to object
   */
  parse(xjsonString) {
    try {
      return JSON.parse(xjsonString);
    } catch (error) {
      throw new Error(`XJSON Parse Error: ${error.message}`);
    }
  }

  /**
   * Execute XJSON document
   */
  execute(xjson) {
    if (typeof xjson === 'string') {
      xjson = this.parse(xjson);
    }

    return this.processNode(xjson);
  }

  /**
   * Process XJSON node
   */
  processNode(node) {
    if (Array.isArray(node)) {
      return node.map(item => this.processNode(item));
    }

    if (typeof node !== 'object' || node === null) {
      return node;
    }

    // Handle control flow
    if (node['@if'] !== undefined) {
      return this.handleIf(node);
    }

    if (node['@while'] !== undefined) {
      return this.handleWhile(node);
    }

    if (node['@for'] !== undefined) {
      return this.handleFor(node);
    }

    // Handle logic blocks
    if (node.type === 'logic' && node.lang === 'kuhul') {
      return this.executeKuhul(node);
    }

    // Handle function definitions
    if (node.type === 'function') {
      this.defineFunction(node);
      return null;
    }

    // Handle function calls
    if (node.type === 'call') {
      return this.callFunction(node);
    }

    // Handle variable assignment
    if (node.type === 'assign') {
      return this.assignVariable(node);
    }

    // Process object recursively
    const result = {};
    for (const key in node) {
      result[key] = this.processNode(node[key]);
    }

    return result;
  }

  /**
   * Handle @if control flow
   */
  handleIf(node) {
    const condition = this.evaluateCondition(node['@if']);

    if (condition) {
      return node['@then'] ? this.processNode(node['@then']) : null;
    } else {
      return node['@else'] ? this.processNode(node['@else']) : null;
    }
  }

  /**
   * Handle @while loop
   */
  handleWhile(node) {
    const results = [];
    let iterations = 0;
    const maxIterations = 10000; // Prevent infinite loops

    while (this.evaluateCondition(node['@while']) && iterations < maxIterations) {
      if (node['@do']) {
        results.push(this.processNode(node['@do']));
      }
      iterations++;
    }

    if (iterations >= maxIterations) {
      throw new Error('Maximum iterations reached in @while loop');
    }

    return results;
  }

  /**
   * Handle @for loop
   */
  handleFor(node) {
    const forExpr = node['@for'];
    const results = [];

    // Simple for loop: @for: {var: "i", from: 0, to: 10}
    if (forExpr.var && forExpr.from !== undefined && forExpr.to !== undefined) {
      const varName = forExpr.var;
      const from = this.evaluate(forExpr.from);
      const to = this.evaluate(forExpr.to);
      const step = forExpr.step ? this.evaluate(forExpr.step) : 1;

      for (let i = from; i < to; i += step) {
        this.variables[varName] = i;
        if (node['@do']) {
          results.push(this.processNode(node['@do']));
        }
      }
    }

    return results;
  }

  /**
   * Execute K'uhul code block
   */
  executeKuhul(node) {
    if (!node.code) {
      throw new Error('K\'uhul logic block missing code');
    }

    const code = Array.isArray(node.code) ? node.code.join('\n') : node.code;

    try {
      return this.interpreter.execute(code);
    } catch (error) {
      throw new Error(`K'uhul execution error: ${error.message}`);
    }
  }

  /**
   * Define function
   */
  defineFunction(node) {
    if (!node.name) {
      throw new Error('Function definition missing name');
    }

    this.functions[node.name] = {
      params: node.params || [],
      body: node.body
    };
  }

  /**
   * Call function
   */
  callFunction(node) {
    if (!node.name) {
      throw new Error('Function call missing name');
    }

    const func = this.functions[node.name];
    if (!func) {
      throw new Error(`Function ${node.name} not defined`);
    }

    // Set parameters
    const args = node.args || [];
    for (let i = 0; i < func.params.length; i++) {
      const paramName = func.params[i];
      const argValue = args[i];
      this.variables[paramName] = this.evaluate(argValue);
    }

    // Execute function body
    return this.processNode(func.body);
  }

  /**
   * Assign variable
   */
  assignVariable(node) {
    if (!node.var) {
      throw new Error('Variable assignment missing var name');
    }

    const value = this.evaluate(node.value);
    this.variables[node.var] = value;
    return value;
  }

  /**
   * Evaluate expression
   */
  evaluate(expr) {
    if (typeof expr !== 'string') {
      return expr;
    }

    // Variable substitution: ${varName}
    const varRegex = /\$\{([^}]+)\}/g;
    let result = expr;

    result = result.replace(varRegex, (match, varName) => {
      if (varName in this.variables) {
        return this.variables[varName];
      }
      if (varName in this.interpreter.variables) {
        return this.interpreter.variables[varName];
      }
      return match;
    });

    // Try to parse as number
    if (!isNaN(result)) {
      return parseFloat(result);
    }

    // Try to parse as boolean
    if (result === 'true') return true;
    if (result === 'false') return false;

    return result;
  }

  /**
   * Evaluate condition
   */
  evaluateCondition(condition) {
    if (typeof condition === 'boolean') {
      return condition;
    }

    if (typeof condition === 'string') {
      const value = this.evaluate(condition);
      return !!value;
    }

    if (typeof condition === 'object') {
      // Handle comparison operators
      if (condition.op && condition.left !== undefined && condition.right !== undefined) {
        const left = this.evaluate(condition.left);
        const right = this.evaluate(condition.right);

        switch (condition.op) {
          case '==': return left == right;
          case '===': return left === right;
          case '!=': return left != right;
          case '!==': return left !== right;
          case '>': return left > right;
          case '<': return left < right;
          case '>=': return left >= right;
          case '<=': return left <= right;
          case '&&': return left && right;
          case '||': return left || right;
          default:
            throw new Error(`Unknown operator: ${condition.op}`);
        }
      }
    }

    return !!condition;
  }

  /**
   * Get variable value
   */
  getVar(name) {
    return this.variables[name] ?? this.interpreter.getVar(name);
  }

  /**
   * Set variable value
   */
  setVar(name, value) {
    this.variables[name] = value;
  }

  /**
   * Reset runtime state
   */
  reset() {
    this.variables = {};
    this.functions = {};
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = XJSONRuntime;
}
