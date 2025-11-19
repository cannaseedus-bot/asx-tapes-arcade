# 🛠️ ASX Tools

Developer tools for the ASX ecosystem.

---

## git-to-tape.js

**Convert any Git repository into an ASX Tape.**

### Installation

```bash
npm link
# or
chmod +x git-to-tape.js
```

### Usage

```bash
cd /path/to/your/git/repo
node /path/to/git-to-tape.js
```

### What It Does

1. Detects if you're in a Git repo
2. Prompts for tape metadata (ID, name, version, etc.)
3. Auto-detects entry point (index.html, dist/, build/, etc.)
4. Auto-detects API handler (route.php, api.php, etc.)
5. Auto-detects category from package.json dependencies
6. Creates `tape.json` manifest
7. Optionally creates recommended directories (agents/, brains/, db/, logs/)
8. Optionally creates starter files (agents.json, asx-db.json)

### Example

```
$ node git-to-tape.js

🔥 ASX Git-to-Tape Conversion Tool

📋 Tape Information

Tape ID [my-app]: my-app
Display Name [my-app]: My Awesome App
Version [1.0.0]: 1.0.0
Description: A cool React app
Author: John Doe

🔍 Detecting entry point...
✓ Found: public/index.html

🔍 Detecting API handler...
✓ Found: route.php

📂 Detecting category...
✓ Detected: web

Additional tags (comma-separated): dashboard, admin

✍️  Writing tape.json...
✓ Created tape.json

Create recommended directories? (y/n): y
✓ Created /agents/
✓ Created /brains/
✓ Created /db/
✓ Created /logs/
✓ Created agents/agents.json
✓ Created db/asx-db.json

✅ Conversion Complete!

Tape Details:
  ID: my-app
  Name: My Awesome App
  Version: 1.0.0
  Entry: /tapes/my-app/public/index.html
  Category: web
  Tags: react, dashboard, admin

Next Steps:
  1. Move this directory to /tapes/
  2. Ensure entry point exists
  3. Test with GHOST host

👻 GHOST will auto-discover your tape!
```

### Result

Your repo now has:

```
my-app/
  .git/
  src/
  public/
    index.html
  route.php
  tape.json           ← NEW
  agents/             ← NEW
    agents.json       ← NEW
  brains/             ← NEW
  db/                 ← NEW
    asx-db.json       ← NEW
  logs/               ← NEW
```

### Move to Tapes Directory

```bash
mv my-app /path/to/tapes/
```

### Verify

```bash
curl http://localhost/ghost/tapes
```

You should see your tape in the list!

---

## Coming Soon

- `tape-packager` - Package tapes as .asxtape files
- `tape-validator` - Validate tape.json against schema
- `tape-deploy` - Deploy tapes to GHOST host
- `tape-clone` - Clone tapes from GitHub

---

**Built with ⟁ by ASX Labs**
