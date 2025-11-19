#!/usr/bin/env node

/**
 * Git-to-Tape Conversion Tool
 * Converts any Git repository into an ASX Tape
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🔥 ASX Git-to-Tape Conversion Tool\n');

  const cwd = process.cwd();
  const dirName = path.basename(cwd);

  // Check if we're in a Git repo
  const isGit = fs.existsSync(path.join(cwd, '.git'));
  if (!isGit) {
    console.log('⚠️  Warning: Not a Git repository. Continuing anyway...');
  }

  // Check if tape.json already exists
  if (fs.existsSync(path.join(cwd, 'tape.json'))) {
    const overwrite = await question('tape.json already exists. Overwrite? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Aborted.');
      rl.close();
      return;
    }
  }

  // Gather info
  console.log('\n📋 Tape Information\n');

  const id = await question(`Tape ID [${dirName}]: `) || dirName;
  const name = await question(`Display Name [${dirName}]: `) || dirName;
  const version = await question('Version [1.0.0]: ') || '1.0.0';
  const description = await question('Description: ') || '';
  const author = await question('Author: ') || 'Unknown';

  // Detect entry point
  console.log('\n🔍 Detecting entry point...');

  let entry = null;
  const possibleEntries = [
    'public/index.html',
    'index.html',
    'dist/index.html',
    'build/index.html',
    'src/index.html'
  ];

  for (const p of possibleEntries) {
    if (fs.existsSync(path.join(cwd, p))) {
      entry = `/tapes/${id}/${p}`;
      console.log(`✓ Found: ${p}`);
      break;
    }
  }

  if (!entry) {
    const customEntry = await question('Entry point path: ');
    entry = customEntry ? `/tapes/${id}/${customEntry}` : `/tapes/${id}/public/index.html`;
  }

  // Detect API handler
  console.log('\n🔍 Detecting API handler...');

  let apiRoute = null;
  const possibleAPIs = [
    'route.php',
    'api.php',
    'server.php',
    'index.php'
  ];

  for (const p of possibleAPIs) {
    if (fs.existsSync(path.join(cwd, p))) {
      apiRoute = `/tapes/${id}/${p}`;
      console.log(`✓ Found: ${p}`);
      break;
    }
  }

  // Detect category
  console.log('\n📂 Detecting category...');

  const packageJsonPath = path.join(cwd, 'package.json');
  let category = 'app';
  let tags = [];

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = Object.keys(pkg.dependencies || {});

      if (deps.some(d => d.includes('react'))) {
        category = 'web';
        tags.push('react');
      }
      if (deps.some(d => d.includes('vue'))) {
        category = 'web';
        tags.push('vue');
      }
      if (deps.some(d => d.includes('game'))) {
        category = 'game';
        tags.push('game');
      }
      if (deps.some(d => d.includes('three'))) {
        category = 'game';
        tags.push('3d');
      }

      console.log(`✓ Detected: ${category}`);
    } catch (e) {
      // Ignore
    }
  }

  // Ask for additional tags
  const additionalTags = await question('Additional tags (comma-separated): ');
  if (additionalTags) {
    tags.push(...additionalTags.split(',').map(t => t.trim()));
  }

  // Create tape.json
  const tapeManifest = {
    id,
    name,
    version,
    description,
    author,
    entry,
    routes: {}
  };

  if (apiRoute) {
    tapeManifest.routes.api = apiRoute;
  }

  tapeManifest.metadata = {
    category,
    tags,
    converted: new Date().toISOString(),
    original_repo: isGit ? 'git' : 'folder'
  };

  // Write tape.json
  console.log('\n✍️  Writing tape.json...');
  fs.writeFileSync(
    path.join(cwd, 'tape.json'),
    JSON.stringify(tapeManifest, null, 2)
  );

  console.log('✓ Created tape.json');

  // Create recommended structure
  const createDirs = await question('\nCreate recommended directories? (y/n): ');

  if (createDirs.toLowerCase() === 'y') {
    const dirs = ['agents', 'brains', 'db', 'logs'];

    for (const dir of dirs) {
      const dirPath = path.join(cwd, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
        console.log(`✓ Created /${dir}/`);
      }
    }

    // Create agents.json
    if (!fs.existsSync(path.join(cwd, 'agents', 'agents.json'))) {
      const agentsJson = {
        [id]: {
          id,
          role: 'app',
          desc: description || `${name} agent`,
          skills: []
        }
      };

      fs.writeFileSync(
        path.join(cwd, 'agents', 'agents.json'),
        JSON.stringify(agentsJson, null, 2)
      );

      console.log('✓ Created agents/agents.json');
    }

    // Create db
    if (!fs.existsSync(path.join(cwd, 'db', 'asx-db.json'))) {
      const db = {
        version: '1.0',
        data: {}
      };

      fs.writeFileSync(
        path.join(cwd, 'db', 'asx-db.json'),
        JSON.stringify(db, null, 2)
      );

      console.log('✓ Created db/asx-db.json');
    }
  }

  // Summary
  console.log('\n✅ Conversion Complete!\n');
  console.log('Tape Details:');
  console.log(`  ID: ${id}`);
  console.log(`  Name: ${name}`);
  console.log(`  Version: ${version}`);
  console.log(`  Entry: ${entry}`);
  console.log(`  Category: ${category}`);
  console.log(`  Tags: ${tags.join(', ')}`);

  console.log('\nNext Steps:');
  console.log('  1. Move this directory to /tapes/');
  console.log('  2. Ensure entry point exists');
  console.log('  3. Test with GHOST host');
  console.log('\n👻 GHOST will auto-discover your tape!\n');

  rl.close();
}

main().catch(console.error);
