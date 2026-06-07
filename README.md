# 🤖 KevooBot v2.0

> Production-ready WhatsApp bot built for **Termux** using Node.js & Baileys.

![Node](https://img.shields.io/badge/Node.js-18%2B-green)
![Baileys](https://img.shields.io/badge/Baileys-Latest-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ⚡ Features

| Category | Features |
|----------|----------|
| **Core** | Prefix commands, auto-read, auto-react, auto-typing, rate limiting |
| **Media** | TikTok download (no watermark), YouTube audio/video, Instagram reels |
| **AI** | AI chat via Groq + OpenRouter fallback |
| **Tools** | Weather, web search, sticker maker, system info |
| **Reliability** | Auto-reconnect, crash recovery, session persistence, error handling |

---

## 📦 Project Structure

```
kevoo-bot/
├── index.js              # Entry point
├── config.js             # Central configuration
├── package.json
├── .env.example          # Environment template
├── .gitignore
│
├── lib/
│   ├── connection.js     # WhatsApp socket & auth
│   ├── messageHandler.js # Message processing & routing
│   ├── commandLoader.js  # Auto-loads command modules
│   ├── apiClient.js      # API integrations with fallback
│   ├── rateLimit.js      # Per-user rate limiting
│   ├── logger.js         # Timestamped logging
│   └── utils.js          # Helpers & utilities
│
├── commands/
│   ├── ping.js           # .ping – latency check
│   ├── menu.js           # .menu – command list
│   ├── alive.js          # .alive – status check
│   ├── ai.js             # .ai – AI chat
│   ├── tiktok.js         # .tiktok – TikTok download
│   ├── youtube.js        # .play – YouTube audio
│   ├── ytvideo.js        # .ytvideo – YouTube video
│   ├── instagram.js      # .ig – Instagram download
│   ├── search.js         # .search – web search
│   ├── weather.js        # .weather – weather info
│   ├── sticker.js        # .sticker – image to sticker
│   ├── owner.js          # .owner – owner contact
│   └── runtime.js        # .runtime – system info
│
├── plugins/              # Custom plugins (future)
└── temp/                 # Auto-cleaned temp files
```

---

## 🚀 Termux Installation (Full Guide)

### Step 1: Install Termux
Download **Termux** from [F-Droid](https://f-droid.org/packages/com.termux/) (NOT Google Play).

### Step 2: Setup Environment

```bash
# Update packages
pkg update && pkg upgrade -y

# Install required packages
pkg install nodejs-lts git ffmpeg -y

# Verify installations
node -v    # Should be 18+
npm -v
git --version
ffmpeg -version
```

### Step 3: Clone & Install Bot

```bash
# Clone the project (or copy files manually)
git clone https://github.com/your-username/kevoo-bot.git
cd kevoo-bot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Step 4: Configure

Edit `.env` with your settings:

```bash
nano .env
```

**Minimum required:**
- `OWNER_NUMBER` – your WhatsApp number (e.g., `2547XXXXXXXX`)
- `GROQ_API_KEY` – get free key from [console.groq.com](https://console.groq.com)

### Step 5: Start the Bot

```bash
node index.js
```

📱 **Scan the QR code** with WhatsApp:
1. Open WhatsApp on your phone
2. Go to **Settings → Linked Devices → Link a Device**
3. Scan the QR shown in terminal

---

## 📋 All Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `.ping` | `.p`, `.speed` | Check bot latency & uptime |
| `.menu` | `.help`, `.commands`, `.h` | Show all commands |
| `.alive` | `.bot`, `.status` | Check if bot is alive |
| `.ai <question>` | `.ask`, `.gpt`, `.chat` | Ask AI anything |
| `.tiktok <url>` | `.tt`, `.ttdl` | Download TikTok video |
| `.play <url>` | `.yta`, `.ytaudio`, `.song` | YouTube audio (MP3) |
| `.ytvideo <url>` | `.ytv`, `.video` | YouTube video (MP4) |
| `.ig <url>` | `.instagram`, `.igdl`, `.insta`, `.reel` | Instagram download |
| `.search <query>` | `.google`, `.ddg`, `.lookup` | Web search |
| `.weather <city>` | `.w`, `.forecast` | Weather information |
| `.sticker` | `.s`, `.stk` | Convert image to sticker |
| `.owner` | `.creator`, `.dev` | Show owner contact |
| `.runtime` | `.uptime`, `.info` | System & runtime info |

---

## 🔑 Free API Keys

| Service | URL | Purpose |
|---------|-----|---------|
| **Groq** | [console.groq.com](https://console.groq.com) | AI chat (very fast, free tier) |
| **OpenRouter** | [openrouter.ai](https://openrouter.ai) | AI fallback (free models) |
| **Open-Meteo** | No key needed | Weather data |
| **DuckDuckGo** | No key needed | Web search |
| **TiklyDown** | No key needed | TikTok download |
| **Cobalt** | No key needed | YT/IG/TT fallback |

---

## 🛡️ Security

- API keys stored in `.env` (never committed)
- All user input sanitized
- Rate limiting per user (configurable)
- Anti-spam loop protection
- No secrets in logs

---

## 🔄 Keep Bot Running (Termux)

### Option 1: tmux (recommended)
```bash
pkg install tmux -y
tmux new -s bot
node index.js
# Press Ctrl+B then D to detach
# Reattach: tmux attach -t bot
```

### Option 2: Termux Wake Lock
```bash
termux-wake-lock
node index.js
```

### Option 3: pm2
```bash
npm install -g pm2
pm2 start index.js --name kevoo-bot
pm2 save
```

---

## 🔧 Adding Custom Commands

Create a new file in `commands/`:

```js
// commands/hello.js
export default {
  name: 'hello',
  aliases: ['hi'],
  category: 'Fun',
  description: 'Say hello!',
  usage: '.hello',

  handler: async (sock, msg, { jid, fullArgs, sender }) => {
    await sock.sendMessage(jid, {
      text: `👋 Hello there!`,
    }, { quoted: msg });
  },
};
```

The bot auto-loads it on next restart. No other files need editing!

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| QR not showing | Delete `auth_session/` folder and restart |
| Connection drops | Bot auto-reconnects; check internet |
| "logged out" error | Delete `auth_session/`, restart, re-scan |
| Module not found | Run `npm install` again |
| Permission denied | Run `termux-setup-storage` first |
| Bot not responding | Check `.env` settings, verify prefix |

---

## 📄 License

MIT License – free to use, modify, and distribute.

---

*Built with ❤️ by Kevoo – Powered by Baileys & Node.js*
