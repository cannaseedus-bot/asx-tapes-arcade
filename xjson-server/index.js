#!/usr/bin/env node
/**
 * ASX XJSON SERVER
 * ================
 * THE PRIMARY BACKEND for ASX Tapes Arcade
 *
 * Replaces:
 * - PHP (optional legacy only)
 * - FastAPI (optional extension)
 * - Express/Flask/etc
 *
 * Provides:
 * - /xjson/run - Execute XJSON programs
 * - /ghost/*    - GHOST protocol endpoints
 * - /kuhul/*    - K'UHUL scheduler
 * - /micronaut/*- Micronaut AI
 * - /agents/*   - Multi-agent routing
 *
 * Usage:
 *   npx asx-server
 *   npm start
 */

import http from 'http';
import url from 'url';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load handlers
import core from './handlers/core.js';
import kuhul from './handlers/kuhul.js';
import agents from './handlers/agents.js';
import fsutils from './handlers/fs.js';
import ghost from './handlers/ghost.js';
import scxq2 from './handlers/scxq2.js';
import micronaut from './handlers/micronaut.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const handlers = {
  ...core,
  ...kuhul,
  ...agents,
  ...fsutils,
  ...ghost,
  ...scxq2,
  ...micronaut
};

console.log('🔥 ASX XJSON SERVER');
console.log('===================');
console.log(`📡 Listening on http://${HOST}:${PORT}`);
console.log(`📦 Handlers loaded: ${Object.keys(handlers).length}`);
console.log('');
console.log('Endpoints:');
console.log('  POST /xjson/run    - Execute XJSON program');
console.log('  GET  /ghost/tapes  - List all tapes');
console.log('  POST /kuhul/run    - K\'UHUL execution');
console.log('  POST /micronaut/*  - Micronaut AI');
console.log('  POST /agents/*     - Multi-agent dispatch');
console.log('');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse body
  let body = '';
  if (req.method === 'POST') {
    await new Promise((resolve) => {
      req.on('data', chunk => { body += chunk; });
      req.on('end', resolve);
    });
  }

  try {
    let data;
    if (body) {
      data = JSON.parse(body);
    }

    // XJSON endpoint
    if (pathname === '/xjson/run') {
      const program = data.program || {};
      const context = data.context || {};
      const type = program.type;

      if (!type || !handlers[type]) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ok: false,
          error: 'Unknown program type',
          available: Object.keys(handlers)
        }));
        return;
      }

      console.log(`[XJSON] Executing: ${type}`);

      const result = await handlers[type]({ input: program.input || context });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        result: result
      }));
      return;
    }

    // Health check
    if (pathname === '/health' || pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        server: 'ASX XJSON Server',
        version: '1.0.0',
        handlers: Object.keys(handlers).length,
        uptime: process.uptime()
      }));
      return;
    }

    // Not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: false,
      error: 'Not found',
      path: pathname
    }));

  } catch (err) {
    console.error('[ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: false,
      error: err.message
    }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
  console.log('');
  console.log('Try it:');
  console.log(`  curl http://${HOST}:${PORT}/health`);
  console.log('');
});
