# 🚀 ASX Tapes Arcade - Installation Guide

**Complete guide to installing and running ASX Tapes Arcade with GHOST host.**

---

## 📋 Prerequisites

### Required:
- **Git** (Git Bash on Windows, or standard Git on Mac/Linux)
- **Web Server** with PHP 7.4+ and cURL extension
  - Apache (recommended)
  - Or any HTTP server that supports PHP

### Optional but Recommended:
- **Node.js** (for using the git-to-tape conversion tool)
- **External AI Services** (Ollama, MX2LM, Qwen) if you want agent routing

---

## 🎯 Quick Install (Git Bash / Terminal)

### Option 1: Install to Web Server Root

```bash
# Navigate to your web server's document root
# For Apache on Linux:
cd /var/www/html

# For XAMPP on Windows:
cd C:/xampp/htdocs

# For MAMP on Mac:
cd /Applications/MAMP/htdocs

# Clone the repository
git clone https://github.com/cannaseedus-bot/asx-tapes-arcade.git

# Navigate into it
cd asx-tapes-arcade

# You're done! The repo is ready to use.
```

### Option 2: Install Anywhere + Symlink

```bash
# Clone to any location
cd ~/projects
git clone https://github.com/cannaseedus-bot/asx-tapes-arcade.git

# Create symlink in web server root
# On Linux/Mac:
sudo ln -s ~/projects/asx-tapes-arcade /var/www/html/asx-tapes-arcade

# On Windows (run as Administrator):
mklink /D C:\xampp\htdocs\asx-tapes-arcade C:\Users\YourName\projects\asx-tapes-arcade
```

---

## 🌐 Access the Arcade

Once installed, open your browser:

```
http://localhost/asx-tapes-arcade/arcade/
```

You should see the **ASX-HOLO Tape Browser** with the green phosphor CRT aesthetic!

---

## 👻 Set Up GHOST Host (Tape Loader)

GHOST is the universal tape host that discovers and loads tapes.

### 1. Verify GHOST Files

```bash
cd asx-tapes-arcade
ls ghost/
```

You should see:
- `index.php` (main router)
- `.htaccess` (Apache config)
- `settings.json` (external services)
- `swarm.json` (agent routing)
- `README.md` (documentation)

### 2. Enable Apache mod_rewrite

**On Linux:**
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

**On XAMPP/MAMP:**
- Usually enabled by default
- Check `httpd.conf` has `LoadModule rewrite_module`

### 3. Configure .htaccess (if needed)

If you're not in the web root, update the `RewriteBase` in `ghost/.htaccess`:

```apache
RewriteEngine On
RewriteBase /asx-tapes-arcade/ghost/

# Route all requests to index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

### 4. Test GHOST

Open in browser:
```
http://localhost/asx-tapes-arcade/ghost/
```

You should see:
```json
{
  "ghost": "v1.0",
  "status": "online",
  "endpoints": { ... }
}
```

### 5. List Tapes

```
http://localhost/asx-tapes-arcade/ghost/tapes
```

This will scan `/tapes/` and return all discovered tapes!

---

## 🎨 Create Your First Tape

### Method 1: Using the UI

1. Open the arcade: `http://localhost/asx-tapes-arcade/arcade/`
2. Click **"CREATE TAPE"** button
3. Choose a template (2D Game, Web App, AI Studio, etc.)
4. Fill in details (name, author, tags)
5. Customize structure
6. Click **"Create Tape"**

### Method 2: Using Git-to-Tape Tool

Convert any existing Git repo into a tape:

```bash
# Navigate to your Git repo
cd ~/my-existing-project

# Run the converter
node /path/to/asx-tapes-arcade/tools/git-to-tape.js

# Follow the prompts
# It will create tape.json and recommended structure

# Move to tapes directory
mv ~/my-existing-project /path/to/asx-tapes-arcade/tapes/my-project

# GHOST will auto-discover it!
```

### Method 3: Manual Creation

```bash
# Create tape directory
cd asx-tapes-arcade/tapes
mkdir my-tape
cd my-tape

# Create manifest
cat > tape.json << 'EOF'
{
  "id": "my-tape",
  "name": "My Tape",
  "version": "1.0.0",
  "entry": "/tapes/my-tape/public/index.html"
}
EOF

# Create UI
mkdir public
echo "<h1>Hello from My Tape!</h1>" > public/index.html

# Done! GHOST will find it automatically
```

---

## 🔧 Configure External Services

If you want to use AI agents (Ollama, MX2LM, Qwen, Cline):

### 1. Edit settings.json

```bash
cd asx-tapes-arcade/ghost
nano settings.json
```

Update the URLs to match your setup:

```json
{
  "external": {
    "ollama": "http://127.0.0.1:11434/api/chat",
    "mx2lm": "http://127.0.0.1:9988/infer",
    "qwen": "http://127.0.0.1:5001/chat",
    "cline": "http://127.0.0.1:9999/run"
  }
}
```

### 2. Start External Services

**Ollama:**
```bash
ollama serve
```

**MX2LM / Qwen / Cline:**
Follow their respective installation guides from:
- https://github.com/cannaseedus-bot/cline
- https://github.com/cannaseedus-bot/KUHUL

### 3. Test Agent Routing

```bash
curl -X POST http://localhost/asx-tapes-arcade/ghost/swarm/route \
  -H "Content-Type: application/json" \
  -d '{
    "task": "code_review",
    "payload": {"code": "console.log('hello');"}
  }'
```

---

## 📁 Directory Structure

After installation:

```
asx-tapes-arcade/
├── arcade/              # Main UI (HOLO Browser)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── ghost/               # GHOST Host (Tape Loader)
│   ├── index.php       # Main router
│   ├── .htaccess       # Apache config
│   ├── settings.json   # External services
│   ├── swarm.json      # Agent routing
│   └── ghost.json      # Auto-generated registry
│
├── tapes/               # Tape Library
│   ├── space-invaders/ # Example game tape
│   └── examples/       # More examples
│
├── studio/              # Development Environment
│   ├── studio-ui.html  # Studio interface
│   ├── create-tape-ui.html
│   └── template-matcher.js
│
├── agents/              # Shared Agents
│   └── cline-agent.json
│
├── tools/               # Developer Tools
│   ├── git-to-tape.js  # Repo converter
│   └── README.md
│
├── klh/                 # KLH Orchestrator
├── kuhul/               # K'uhul Interpreter
├── scx/                 # SCX Cipher
├── xjson/               # XJSON Runtime
│
└── Documentation:
    ├── README.md
    ├── INSTALL.md                  # This file
    ├── ASX-REPLACES-FRAMEWORKS.md  # Why ASX replaces React
    ├── GHOST-SPECIFICATION.md      # GHOST protocol spec
    ├── ASX-TAPE-STANDARD-v1-RFC.md # Tape standard
    ├── HOLO-UI-STANDARD.html       # Visual design system
    └── README-ASX-PARADIGM.md      # Complete vision
```

---

## 🎮 Load Example Tapes

### Space Invaders (Included)

```
http://localhost/asx-tapes-arcade/tapes/examples/space-invaders/public/index.html
```

### Clone More Tapes from GitHub

```bash
cd asx-tapes-arcade/tapes

# Clone Cline DevOps tape
git clone https://github.com/cannaseedus-bot/cline.git cline

# Clone KUHUL Multi-Agent Hive
git clone https://github.com/cannaseedus-bot/KUHUL.git kuhul-hive

# GHOST will auto-discover them!
```

---

## 🔄 Update ASX Tapes Arcade

```bash
cd asx-tapes-arcade

# Pull latest changes
git pull origin main

# If you made local changes, stash first
git stash
git pull origin main
git stash pop
```

---

## 🐛 Troubleshooting

### GHOST Returns 404

**Problem:** Accessing `/ghost/` shows 404

**Solution:**
1. Check Apache mod_rewrite is enabled
2. Verify `.htaccess` exists in `ghost/` directory
3. Check `AllowOverride All` in Apache config
4. Restart Apache

### Tapes Not Showing Up

**Problem:** `/ghost/tapes` returns empty array

**Solution:**
1. Check `/tapes/` directory exists
2. Verify tapes have `tape.json` files
3. Check JSON is valid: `cat tapes/my-tape/tape.json | python -m json.tool`
4. Check file permissions (PHP needs read access)

### PHP Errors

**Problem:** White screen or PHP errors

**Solution:**
1. Check PHP version: `php -v` (need 7.4+)
2. Check cURL extension: `php -m | grep curl`
3. Check error log: `tail -f /var/log/apache2/error.log`
4. Enable display_errors in php.ini for debugging

### External Agents Not Working

**Problem:** Swarm routing fails

**Solution:**
1. Verify service is running: `curl http://localhost:11434` (Ollama)
2. Check `ghost/settings.json` URLs are correct
3. Check network/firewall settings
4. Test service directly before using GHOST

---

## 🌟 Advanced Setup

### Custom Domain

Add to Apache virtual host:

```apache
<VirtualHost *:80>
    ServerName asx.local
    DocumentRoot /var/www/html/asx-tapes-arcade

    <Directory /var/www/html/asx-tapes-arcade>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Add to `/etc/hosts`:
```
127.0.0.1  asx.local
```

Access: `http://asx.local/`

### HTTPS Setup

```bash
# Generate self-signed cert (for local dev)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/asx.key \
  -out /etc/ssl/certs/asx.crt

# Update Apache virtual host
<VirtualHost *:443>
    ServerName asx.local
    DocumentRoot /var/www/html/asx-tapes-arcade

    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/asx.crt
    SSLCertificateKeyFile /etc/ssl/private/asx.key
</VirtualHost>
```

### Production Deployment

For deploying to production server:

```bash
# On production server
cd /var/www/html
git clone https://github.com/cannaseedus-bot/asx-tapes-arcade.git

# Set proper permissions
chown -R www-data:www-data asx-tapes-arcade
chmod -R 755 asx-tapes-arcade

# Configure Apache virtual host
# Set up SSL with Let's Encrypt
# Configure firewall rules
```

---

## 📚 Next Steps

1. **Read the docs:**
   - `ASX-REPLACES-FRAMEWORKS.md` - Why ASX replaces React
   - `GHOST-SPECIFICATION.md` - GHOST protocol
   - `ASX-TAPE-STANDARD-v1-RFC.md` - Tape standard

2. **Explore examples:**
   - Browse `/tapes/examples/`
   - Load tapes in arcade
   - Study their structure

3. **Create your first tape:**
   - Use the CREATE TAPE button
   - Or convert an existing Git repo
   - Or build from scratch

4. **Integrate AI agents:**
   - Set up Ollama/MX2LM/Qwen
   - Configure GHOST swarm routing
   - Test multi-agent workflows

5. **Join the ecosystem:**
   - Share your tapes on GitHub
   - Add `tape.json` to your repos
   - Build with the ASX paradigm

---

## 💬 Support

- **Issues:** https://github.com/cannaseedus-bot/asx-tapes-arcade/issues
- **Cline Bot:** https://github.com/cannaseedus-bot/cline
- **KUHUL Hive:** https://github.com/cannaseedus-bot/KUHUL

---

## 📜 License

MIT - Build whatever you want. No restrictions. Forever.

---

**Built with ⟁ by ASX Labs**

*The post-framework future starts here.*
