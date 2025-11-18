/**
 * K'uhul Language Interpreter
 * Stack-based programming language with Mayan-inspired syntax
 *
 * Operations:
 * - Pop: Function start
 * - Wo: Push literal
 * - Ch'en: Store variable
 * - Yax: Load variable
 * - Sek: Operations (add, sub, mul, div, gt, lt, eq, etc.)
 * - Xul: Function end
 */

class KuhulInterpreter {
  constructor() {
    this.stack = [];
    this.variables = {};
    this.functions = {};
    this.currentFunction = null;
  }

  // Reset interpreter state
  reset() {
    this.stack = [];
    this.variables = {};
    this.currentFunction = null;
  }

  // Parse K'uhul code
  parse(code) {
    // Remove comments
    code = code.replace(/;[^\n]*/g, '');

    // Extract tokens between brackets
    const tokenRegex = /\[([^\]]+)\]/g;
    const tokens = [];
    let match;

    while ((match = tokenRegex.exec(code)) !== null) {
      const content = match[1].trim();
      const parts = content.split(/\s+/);
      tokens.push(parts);
    }

    return tokens;
  }

  // Execute K'uhul code
  execute(code) {
    const tokens = this.parse(code);

    for (const token of tokens) {
      this.executeToken(token);
    }

    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
  }

  // Execute single token
  executeToken(token) {
    const [op, ...args] = token;

    switch (op) {
      case 'Pop':
        this.opPop(args[0]);
        break;
      case 'Wo':
        this.opWo(args[0]);
        break;
      case "Ch'en":
      case 'Chen':
        this.opChen(args[0]);
        break;
      case 'Yax':
        this.opYax(args[0]);
        break;
      case 'Sek':
        this.opSek(args[0]);
        break;
      case 'Xul':
        this.opXul();
        break;
      default:
        throw new Error(`Unknown operation: ${op}`);
    }
  }

  // Pop: Start function definition
  opPop(name) {
    this.currentFunction = name;
    this.functions[name] = [];
  }

  // Wo: Push literal value
  opWo(value) {
    // Parse value
    let parsed;

    if (value.startsWith('"') && value.endsWith('"')) {
      // String literal
      parsed = value.slice(1, -1);
    } else if (value === 'true') {
      parsed = true;
    } else if (value === 'false') {
      parsed = false;
    } else if (!isNaN(value)) {
      // Number
      parsed = parseFloat(value);
    } else {
      parsed = value;
    }

    this.stack.push(parsed);
  }

  // Ch'en: Store variable
  opChen(name) {
    if (this.stack.length === 0) {
      throw new Error(`Stack underflow at Ch'en ${name}`);
    }
    const value = this.stack.pop();
    this.variables[name] = value;
  }

  // Yax: Load variable
  opYax(name) {
    if (!(name in this.variables)) {
      throw new Error(`Variable ${name} not defined`);
    }
    this.stack.push(this.variables[name]);
  }

  // Sek: Operations
  opSek(operation) {
    switch (operation) {
      case 'add':
        this.binaryOp((a, b) => a + b);
        break;
      case 'sub':
        this.binaryOp((a, b) => a - b);
        break;
      case 'mul':
        this.binaryOp((a, b) => a * b);
        break;
      case 'div':
        this.binaryOp((a, b) => a / b);
        break;
      case 'gt':
        this.binaryOp((a, b) => a > b);
        break;
      case 'lt':
        this.binaryOp((a, b) => a < b);
        break;
      case 'gte':
        this.binaryOp((a, b) => a >= b);
        break;
      case 'lte':
        this.binaryOp((a, b) => a <= b);
        break;
      case 'eq':
        this.binaryOp((a, b) => a === b);
        break;
      case 'neq':
        this.binaryOp((a, b) => a !== b);
        break;
      case 'and':
        this.binaryOp((a, b) => a && b);
        break;
      case 'or':
        this.binaryOp((a, b) => a || b);
        break;
      case 'not':
        this.unaryOp(a => !a);
        break;
      case 'print':
        console.log(this.stack.pop());
        break;
      case 'rand':
        this.stack.push(Math.random());
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  // Binary operation
  binaryOp(fn) {
    if (this.stack.length < 2) {
      throw new Error('Stack underflow in binary operation');
    }
    const b = this.stack.pop();
    const a = this.stack.pop();
    this.stack.push(fn(a, b));
  }

  // Unary operation
  unaryOp(fn) {
    if (this.stack.length < 1) {
      throw new Error('Stack underflow in unary operation');
    }
    const a = this.stack.pop();
    this.stack.push(fn(a));
  }

  // Xul: End function
  opXul() {
    this.currentFunction = null;
  }

  // Get variable value
  getVar(name) {
    return this.variables[name];
  }

  // Set variable value
  setVar(name, value) {
    this.variables[name] = value;
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KuhulInterpreter;
}
