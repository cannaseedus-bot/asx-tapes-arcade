#!/usr/bin/env node

/**
 * ASX TAPE ARCADE - Test Suite
 * Comprehensive testing for all components
 */

const KuhulInterpreter = require('../kuhul/interpreter.js');
const SCXCipher = require('../scx/cipher.js');
const XJSONRuntime = require('../xjson/runtime.js');
const KLHOrchestrator = require('../klh/orchestrator.js');
const TapeSystem = require('../tapes/tape-system.js');

class TestSuite {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🎮 ASX TAPE ARCADE - Test Suite\n');
    console.log('='.repeat(50));

    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error.message}`);
      }
    }

    console.log('='.repeat(50));
    console.log(`\nResults: ${this.passed} passed, ${this.failed} failed`);
    console.log(`Total: ${this.tests.length} tests\n`);

    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }
}

// Create test suite
const suite = new TestSuite();

// ====================
// K'uhul Interpreter Tests
// ====================

suite.test('K\'uhul: Basic arithmetic', () => {
  const kuhul = new KuhulInterpreter();
  kuhul.execute('[Wo 5]→[Wo 3]→[Sek add]→[Ch\'en result]');
  suite.assertEqual(kuhul.getVar('result'), 8);
});

suite.test('K\'uhul: Variable storage and retrieval', () => {
  const kuhul = new KuhulInterpreter();
  kuhul.execute('[Wo 10]→[Ch\'en x]');
  suite.assertEqual(kuhul.getVar('x'), 10);
});

suite.test('K\'uhul: Subtraction', () => {
  const kuhul = new KuhulInterpreter();
  kuhul.execute('[Wo 20]→[Wo 5]→[Sek sub]→[Ch\'en result]');
  suite.assertEqual(kuhul.getVar('result'), 15);
});

suite.test('K\'uhul: Multiplication', () => {
  const kuhul = new KuhulInterpreter();
  kuhul.execute('[Wo 4]→[Wo 5]→[Sek mul]→[Ch\'en result]');
  suite.assertEqual(kuhul.getVar('result'), 20);
});

suite.test('K\'uhul: Division', () => {
  const kuhul = new KuhulInterpreter();
  kuhul.execute('[Wo 20]→[Wo 4]→[Sek div]→[Ch\'en result]');
  suite.assertEqual(kuhul.getVar('result'), 5);
});

suite.test('K\'uhul: Greater than comparison', () => {
  const kuhul = new KuhulInterpreter();
  kuhul.execute('[Wo 10]→[Wo 5]→[Sek gt]→[Ch\'en result]');
  suite.assertEqual(kuhul.getVar('result'), true);
});

suite.test('K\'uhul: Less than comparison', () => {
  const kuhul = new KuhulInterpreter();
  kuhul.execute('[Wo 3]→[Wo 5]→[Sek lt]→[Ch\'en result]');
  suite.assertEqual(kuhul.getVar('result'), true);
});

suite.test('K\'uhul: Equality comparison', () => {
  const kuhul = new KuhulInterpreter();
  kuhul.execute('[Wo 5]→[Wo 5]→[Sek eq]→[Ch\'en result]');
  suite.assertEqual(kuhul.getVar('result'), true);
});

suite.test('K\'uhul: NOT operation', () => {
  const kuhul = new KuhulInterpreter();
  kuhul.execute('[Wo true]→[Sek not]→[Ch\'en result]');
  suite.assertEqual(kuhul.getVar('result'), false);
});

suite.test('K\'uhul: Boolean AND', () => {
  const kuhul = new KuhulInterpreter();
  kuhul.execute('[Wo true]→[Wo true]→[Sek and]→[Ch\'en result]');
  suite.assertEqual(kuhul.getVar('result'), true);
});

suite.test('K\'uhul: Function definition', () => {
  const kuhul = new KuhulInterpreter();
  const code = `
    [Pop test_func]
      [Wo 42]→[Ch'en answer]
    [Xul]
  `;
  kuhul.execute(code);
  suite.assertEqual(kuhul.getVar('answer'), 42);
});

suite.test('K\'uhul: String storage', () => {
  const kuhul = new KuhulInterpreter();
  kuhul.execute('[Wo "hello"]→[Ch\'en msg]');
  suite.assertEqual(kuhul.getVar('msg'), 'hello');
});

// ====================
// SCX Cipher Tests
// ====================

suite.test('SCX: Basic encoding', () => {
  const scx = new SCXCipher();
  const code = '[Wo 10]→[Ch\'en x]';
  const encoded = scx.encode(code);
  suite.assert(encoded.includes('⟁'), 'Should contain delimiter');
});

suite.test('SCX: Encoding and decoding', () => {
  const scx = new SCXCipher();
  const original = '[Wo 10]→[Ch\'en x]';
  const encoded = scx.encode(original);
  const decoded = scx.decode(encoded);
  suite.assert(decoded.includes('Wo') && decoded.includes('10'), 'Should preserve content');
});

suite.test('SCX: Compression provides stats', () => {
  const scx = new SCXCipher();
  const code = '[Wo 10]→[Ch\'en x]';
  const result = scx.compress(code);
  suite.assert(result.original && result.compressed && result.ratio, 'Should have stats');
});

suite.test('SCX: Validate correct cipher', () => {
  const scx = new SCXCipher();
  const cipher = '⟁Wo⟁10⟁Ch\'en⟁x⟁';
  const validation = scx.validate(cipher);
  suite.assertEqual(validation.valid, true);
});

suite.test('SCX: Dictionary entry creation', () => {
  const scx = new SCXCipher();
  const entry = scx.createDictionaryEntry('⟁Wo⟁10⟁Ch\'en⟁x⟁', 'Test entry');
  suite.assert(entry.scx && entry.kuhul && entry.description, 'Should have all fields');
});

// ====================
// XJSON Runtime Tests
// ====================

suite.test('XJSON: Basic parsing', () => {
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const obj = xjson.parse('{"test": true}');
  suite.assertEqual(obj.test, true);
});

suite.test('XJSON: @if control flow - true branch', () => {
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const result = xjson.execute({
    "@if": true,
    "@then": { value: "yes" },
    "@else": { value: "no" }
  });
  suite.assertEqual(result.value, 'yes');
});

suite.test('XJSON: @if control flow - false branch', () => {
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const result = xjson.execute({
    "@if": false,
    "@then": { value: "yes" },
    "@else": { value: "no" }
  });
  suite.assertEqual(result.value, 'no');
});

suite.test('XJSON: Variable assignment', () => {
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  xjson.execute({
    type: 'assign',
    var: 'test',
    value: 123
  });
  suite.assertEqual(xjson.getVar('test'), 123);
});

suite.test('XJSON: K\'uhul code execution', () => {
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  xjson.execute({
    type: 'logic',
    lang: 'kuhul',
    code: '[Wo 10]→[Ch\'en x]'
  });
  suite.assertEqual(kuhul.getVar('x'), 10);
});

suite.test('XJSON: Comparison operator', () => {
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const result = xjson.evaluateCondition({
    op: '>',
    left: 10,
    right: 5
  });
  suite.assertEqual(result, true);
});

// ====================
// KLH Orchestrator Tests
// ====================

suite.test('KLH: Register hive', () => {
  const klh = new KLHOrchestrator();
  const hive = klh.registerHive('test-hive', { name: 'Test', port: 3001 });
  suite.assertEqual(hive.id, 'test-hive');
});

suite.test('KLH: Start hive', () => {
  const klh = new KLHOrchestrator();
  klh.registerHive('test-hive', { name: 'Test', port: 3001 });
  const hive = klh.startHive('test-hive');
  suite.assertEqual(hive.status, 'online');
});

suite.test('KLH: Stop hive', () => {
  const klh = new KLHOrchestrator();
  klh.registerHive('test-hive', { name: 'Test', port: 3001 });
  klh.startHive('test-hive');
  const hive = klh.stopHive('test-hive');
  suite.assertEqual(hive.status, 'offline');
});

suite.test('KLH: Register tape', () => {
  const klh = new KLHOrchestrator();
  const tape = klh.registerTape('test-tape', { name: 'Test Tape', path: '/test' });
  suite.assertEqual(tape.id, 'test-tape');
});

suite.test('KLH: Mount tape to hive', () => {
  const klh = new KLHOrchestrator();
  klh.registerHive('test-hive', { name: 'Test', port: 3001 });
  klh.registerTape('test-tape', { name: 'Test', path: '/test', routes: [], agents: [] });
  const tape = klh.mountTape('test-tape', 'test-hive');
  suite.assertEqual(tape.status, 'mounted');
  suite.assertEqual(tape.hiveId, 'test-hive');
});

suite.test('KLH: Unmount tape', () => {
  const klh = new KLHOrchestrator();
  klh.registerHive('test-hive', { name: 'Test', port: 3001 });
  klh.registerTape('test-tape', { name: 'Test', path: '/test', routes: [], agents: [] });
  klh.mountTape('test-tape', 'test-hive');
  const tape = klh.unmountTape('test-tape');
  suite.assertEqual(tape.status, 'unmounted');
  suite.assertEqual(tape.hiveId, null);
});

suite.test('KLH: Get hive matrix', () => {
  const klh = new KLHOrchestrator();
  klh.registerHive('hive1', { name: 'Hive 1', port: 3001 });
  klh.registerHive('hive2', { name: 'Hive 2', port: 3002 });
  const matrix = klh.getHiveMatrix();
  suite.assertEqual(matrix.hives.length, 2);
});

suite.test('KLH: Register agent', () => {
  const klh = new KLHOrchestrator();
  klh.registerHive('test-hive', { name: 'Test', port: 3001 });
  const agent = klh.registerAgent('test-agent', 'test-tape', 'test-hive', { type: 'Mx2JS' });
  suite.assertEqual(agent.id, 'test-agent');
});

suite.test('KLH: Inter-hive communication', () => {
  const klh = new KLHOrchestrator();
  klh.registerHive('hive1', { name: 'Hive 1', port: 3001 });
  klh.startHive('hive1');
  klh.registerHive('hive2', { name: 'Hive 2', port: 3002 });
  klh.startHive('hive2');
  const message = klh.sendToHive('hive1', 'hive2', { data: 'test' });
  suite.assertEqual(message.from, 'hive1');
  suite.assertEqual(message.to, 'hive2');
});

suite.test('KLH: Get system status', () => {
  const klh = new KLHOrchestrator();
  klh.registerHive('hive1', { name: 'Hive 1', port: 3001 });
  const status = klh.getStatus();
  suite.assert(status.hives >= 1, 'Should have at least 1 hive');
});

// ====================
// Tape System Tests
// ====================

suite.test('Tape System: Create tape', () => {
  const klh = new KLHOrchestrator();
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const tapeSystem = new TapeSystem(klh, xjson);

  const tape = tapeSystem.createTape('test-tape', {
    name: 'Test Tape',
    version: '1.0.0'
  });

  suite.assertEqual(tape.id, 'test-tape');
  suite.assertEqual(tape.name, 'Test Tape');
});

suite.test('Tape System: Load tape', () => {
  const klh = new KLHOrchestrator();
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const tapeSystem = new TapeSystem(klh, xjson);

  const config = {
    id: 'test-tape',
    name: 'Test',
    version: '1.0.0',
    brains: [],
    agents: [],
    routes: []
  };

  const tape = tapeSystem.loadTape(config);
  suite.assertEqual(tape.id, 'test-tape');
});

suite.test('Tape System: Mount to hive', () => {
  const klh = new KLHOrchestrator();
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const tapeSystem = new TapeSystem(klh, xjson);

  klh.registerHive('test-hive', { name: 'Test', port: 3001 });

  const tape = tapeSystem.createTape('test-tape', { name: 'Test' });
  tapeSystem.mountToHive('test-tape', 'test-hive');

  const mounted = klh.getTapeInfo('test-tape');
  suite.assertEqual(mounted.hiveId, 'test-hive');
});

suite.test('Tape System: Get tape state', () => {
  const klh = new KLHOrchestrator();
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const tapeSystem = new TapeSystem(klh, xjson);

  const tape = tapeSystem.createTape('test-tape', { name: 'Test', state: { score: 100 } });
  const state = tapeSystem.getTapeState('test-tape');

  suite.assertEqual(state.state.score, 100);
});

suite.test('Tape System: Update tape state', () => {
  const klh = new KLHOrchestrator();
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const tapeSystem = new TapeSystem(klh, xjson);

  const tape = tapeSystem.createTape('test-tape', { name: 'Test', state: { score: 0 } });
  tapeSystem.updateTapeState('test-tape', { score: 100 });

  suite.assertEqual(tape.state.score, 100);
});

suite.test('Tape System: DB write operation', () => {
  const klh = new KLHOrchestrator();
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const tapeSystem = new TapeSystem(klh, xjson);

  const tape = tapeSystem.createTape('test-tape', { name: 'Test' });
  const result = tapeSystem.executeTapeAction('test-tape', 'db', {
    operation: 'write',
    collection: 'scores',
    data: { player: 'Test', score: 1000 }
  });

  suite.assertEqual(result.score, 1000);
});

suite.test('Tape System: Package tape', () => {
  const klh = new KLHOrchestrator();
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const tapeSystem = new TapeSystem(klh, xjson);

  const tape = tapeSystem.createTape('test-tape', { name: 'Test' });
  const packaged = tapeSystem.packageTape('test-tape');

  suite.assert(packaged.includes('test-tape'), 'Should contain tape ID');
});

// ====================
// Integration Tests
// ====================

suite.test('Integration: Complete workflow', () => {
  // Initialize all systems
  const klh = new KLHOrchestrator();
  const kuhul = new KuhulInterpreter();
  const xjson = new XJSONRuntime(kuhul);
  const tapeSystem = new TapeSystem(klh, xjson);

  // Create hive
  klh.registerHive('game-hive', { name: 'Games', port: 3002 });
  klh.startHive('game-hive');

  // Create and load tape
  const tape = tapeSystem.createTape('game-tape', {
    name: 'Test Game',
    state: { score: 0 }
  });

  // Mount tape
  tapeSystem.mountToHive('game-tape', 'game-hive');

  // Update state
  tapeSystem.updateTapeState('game-tape', { score: 100 });

  // Verify
  const state = tapeSystem.getTapeState('game-tape');
  suite.assertEqual(state.state.score, 100);

  const hiveInfo = klh.getHiveInfo('game-hive');
  suite.assert(hiveInfo.tapes.includes('Test Game'), 'Hive should contain tape');
});

// Run the test suite
suite.run().then(success => {
  process.exit(success ? 0 : 1);
});
