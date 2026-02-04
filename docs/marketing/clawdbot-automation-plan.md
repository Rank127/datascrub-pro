# OpenClaw Social Media Automation Plan

**Goal:** Set up OpenClaw on Ubuntu Dell 7670 workstation for fully autonomous social media automation using your existing tool subscriptions.

**Membership Tracker:** http://127.0.0.1:5000/

---

## What is OpenClaw?

OpenClaw (formerly Clawdbot/Moltbot) is an open-source autonomous AI agent:

| Feature | Details |
|---------|---------|
| GitHub Stars | 157,000+ |
| Skills Available | 3,000+ in registry |
| Curated Skills | 1,715+ organized by category |
| Integrations | 50+ built-in |
| Architecture | Self-hosted, privacy-focused |
| Operation | 24/7 autonomous |
| Memory | Persistent across weeks |
| Self-Improving | Creates its own skills |

**Official Site:** https://openclaw.ai/
**Documentation:** https://docs.openclaw.ai/
**Skills Registry:** https://github.com/VoltAgent/awesome-openclaw-skills

---

## Your Tool Stack Integration

### Tools OpenClaw Will Use

| Tool | Cost | Purpose | Integration |
|------|------|---------|-------------|
| Claude | $200/mo | Primary AI brain | API connection |
| OpenAI/GPT | $20/mo | Backup/fallback AI | API connection |
| HeyGen | $30/mo | AI avatar videos | API/browser |
| ElevenLabs | $22/mo | Voice cloning | API connection |
| CapCut | $90/yr | Video editing | File output |
| Creatify.ai | FREE | Ad creation | API/browser |
| Mixpost | FREE | Social scheduling | Skill integration |
| Discord | FREE | Team commands | Native integration |
| Resend | $20/mo | Email alerts | Webhook |
| Twilio | FREE | SMS alerts | API connection |
| ClickUp | $90/yr | Task management | API/webhook |
| Capsolver | $100/mo | CAPTCHA solving | API connection |

### Tools OpenClaw Replaces

| Tool | Cost | How OpenClaw Replaces |
|------|------|----------------------|
| Publer | $21-42/mo | Mixpost skill (FREE) |
| Zapier | $10/mo | Built-in automation |
| ScrapingBee | $50/mo | Browser scraping skills |

**Annual Savings: ~$960-1,200**

---

## Phase 1: Prerequisites

### 1.1 System Requirements
- [ ] Ubuntu workstation (Dell 7670) ready
- [ ] Docker & Docker Compose installed
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] 8GB+ RAM recommended
- [ ] 50GB+ storage for models/data

### 1.2 Install Docker
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### 1.3 Clone OpenClaw
```bash
cd ~/projects
git clone https://github.com/openclaw/openclaw.git
cd openclaw
```

---

## Phase 2: OpenClaw Installation

### 2.1 Environment Configuration
```bash
cp .env.example .env
nano .env
```

**Environment Variables:**
```env
# AI Model Configuration
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key_backup

# Model Settings
DEFAULT_MODEL=claude-3-opus
FALLBACK_MODEL=gpt-4

# Gateway Settings
GATEWAY_PORT=3000
GATEWAY_HOST=0.0.0.0

# Discord Integration
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_server_id

# Notifications
RESEND_API_KEY=your_resend_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Your Apps
MEMBERSHIP_TRACKER_URL=http://127.0.0.1:5000/
CLICKUP_API_KEY=your_clickup_key

# Video Generation
HEYGEN_API_KEY=your_heygen_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Automation
CAPSOLVER_API_KEY=your_capsolver_key
```

### 2.2 Docker Setup
```bash
# Build and start
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f openclaw

# Verify running
curl http://localhost:3000/health
```

### 2.3 Verify Installation
```bash
# Test OpenClaw CLI
openclaw --version

# Test a simple command
openclaw "Hello, confirm you are working"
```

---

## Phase 3: Install Mixpost (Social Scheduler)

### 3.1 What is Mixpost?
Self-hosted social media scheduler (Buffer alternative):
- **No subscriptions, no limits**
- **Your data on your server**
- Supports: Twitter/X, LinkedIn, Facebook, Instagram, TikTok, Bluesky, Threads, Mastodon

**GitHub:** https://github.com/inovector/mixpost

### 3.2 Install Mixpost via Docker
```bash
# Create directory
mkdir -p ~/mixpost && cd ~/mixpost

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  mixpost:
    image: inovector/mixpost:latest
    ports:
      - "8080:80"
    volumes:
      - mixpost_data:/var/www/html/storage
    environment:
      - APP_URL=http://localhost:8080
      - DB_CONNECTION=sqlite
    restart: unless-stopped

volumes:
  mixpost_data:
EOF

# Start Mixpost
docker compose up -d

# Access at http://localhost:8080
```

### 3.3 Connect Social Accounts in Mixpost
1. Open http://localhost:8080
2. Create admin account
3. Go to Settings → Social Accounts
4. Connect each platform:
   - [ ] Twitter/X
   - [ ] LinkedIn
   - [ ] Facebook
   - [ ] Instagram
   - [ ] TikTok
   - [ ] Bluesky
   - [ ] YouTube (if supported)

### 3.4 Install Mixpost Skill in OpenClaw
```bash
# Install the Mixpost skill
clawhub install mixpost

# Configure connection
openclaw config set mixpost.url http://localhost:8080
openclaw config set mixpost.api_key YOUR_MIXPOST_API_KEY
```

---

## Phase 4: Install OpenClaw Skills

### 4.1 Skill Categories Available

| Category | Skills | Install Command |
|----------|--------|-----------------|
| Marketing & Sales | 94 | `clawhub install marketing` |
| Browser & Automation | 69 | `clawhub install browser` |
| Search & Research | 148 | `clawhub install research` |
| Calendar & Scheduling | 28 | `clawhub install calendar` |
| Communication | 58 | `clawhub install communication` |
| AI & LLMs | 159 | `clawhub install ai-tools` |
| Speech & Transcription | 44 | `clawhub install speech` |
| Productivity | 93 | `clawhub install productivity` |

### 4.2 Install Recommended Skills
```bash
# Core social media automation
clawhub install mixpost           # Social scheduling
clawhub install marketing         # Marketing automation
clawhub install browser           # Browser automation
clawhub install research          # Trend detection
clawhub install speech            # Video transcription

# Productivity
clawhub install calendar          # Scheduling
clawhub install productivity      # Task management

# AI enhancement
clawhub install ai-tools          # AI model tools
```

### 4.3 Verify Installed Skills
```bash
# List all installed skills
clawhub list

# Test a skill
openclaw "Use the marketing skill to analyze competitor DeleteMe"
```

---

## Phase 5: Discord Integration (Team Commands)

### 5.1 Create Discord Bot
1. Go to https://discord.com/developers/applications
2. Create New Application → "GhostMyData Bot"
3. Go to Bot → Add Bot
4. Copy Bot Token → Add to .env
5. Enable these Intents:
   - Message Content Intent
   - Server Members Intent

### 5.2 Invite Bot to Server
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot
```

### 5.3 Create Discord Channels
```
#ghostmydata-social
├── #commands        (send commands to OpenClaw)
├── #content-queue   (pending approvals)
├── #approved        (scheduled content)
├── #alerts          (notifications)
├── #analytics       (daily reports)
└── #general         (team chat)
```

### 5.4 Discord Commands
```
/post [content] [platforms] [time]
  Example: /post "Your data is exposed" twitter,linkedin "tomorrow 9am"

/schedule [content] [platforms] [schedule]
  Example: /schedule "Privacy tip" all "daily 9am"

/queue
  Shows pending posts

/approve [post-id]
  Approves a queued post

/reject [post-id] [reason]
  Rejects with feedback

/stats [period]
  Example: /stats week

/pause
  Pauses all posting

/resume
  Resumes posting

/trend [topic]
  Example: /trend "data privacy"

/competitor [name]
  Example: /competitor "DeleteMe"
```

---

## Phase 6: Video Pipeline (HeyGen + ElevenLabs)

### 6.1 Configure Video Generation
```bash
# Set API keys in OpenClaw
openclaw config set heygen.api_key YOUR_HEYGEN_KEY
openclaw config set elevenlabs.api_key YOUR_ELEVENLABS_KEY
```

### 6.2 Create Avatar in HeyGen
1. Go to https://heygen.com
2. Create custom avatar (or use template)
3. Note Avatar ID for automation

### 6.3 Clone Voice in ElevenLabs
1. Go to https://elevenlabs.io
2. Voice Lab → Add Voice → Instant Voice Cloning
3. Upload 1-5 minutes of clear audio
4. Note Voice ID for automation

### 6.4 Video Generation Workflow
```
Discord: "/video Create a 60-second TikTok about spam calls"
         ↓
OpenClaw: Generates script using Claude
         ↓
OpenClaw: Sends script to ElevenLabs → Audio file
         ↓
OpenClaw: Sends audio + avatar to HeyGen → Video file
         ↓
OpenClaw: Sends video to Mixpost → Scheduled
         ↓
OpenClaw: Notifies Discord → "Video scheduled for tomorrow 9am"
```

### 6.5 Video Command Examples
```
/video [topic] [platform] [length]
  Example: /video "data brokers explained" tiktok 60s

/batch-video [topics-file] [platform]
  Example: /batch-video privacy-topics.txt instagram

/video-status
  Shows rendering queue
```

---

## Phase 7: Automation Workflows

### 7.1 Content Generation Flow
```
┌─────────────────┐
│  Trigger        │ (Cron job, Discord command, webhook)
└────────┬────────┘
         ▼
┌─────────────────┐
│  OpenClaw       │ (Generates content via Claude)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Confidence     │ (Scores content quality)
│  Check          │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ ≥85%  │ │ <85%  │
│ Auto  │ │ Queue │
│ Post  │ │ Review│
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌─────────────────┐
│  Mixpost        │ (Schedules/posts)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Notify         │ (Discord, Email, SMS)
└─────────────────┘
```

### 7.2 Cron Jobs (Scheduled Tasks)
```bash
# Edit OpenClaw cron configuration
openclaw cron edit
```

```yaml
# content-generation.yaml
schedules:
  # Generate daily content batch
  - name: daily-content
    cron: "0 6 * * *"  # 6 AM daily
    command: "Generate 10 social posts about privacy for today"

  # Morning engagement
  - name: morning-engagement
    cron: "0 9 * * *"  # 9 AM daily
    command: "Find and respond to 20 privacy-related posts on Twitter"

  # Trend check
  - name: trend-check
    cron: "0 */4 * * *"  # Every 4 hours
    command: "Check trending topics in privacy/cybersecurity and suggest content"

  # Competitor monitoring
  - name: competitor-watch
    cron: "0 10 * * *"  # 10 AM daily
    command: "Monitor DeleteMe and Incogni for new content, summarize"

  # Weekly analytics
  - name: weekly-report
    cron: "0 9 * * 1"  # Monday 9 AM
    command: "Generate weekly social media performance report"
```

### 7.3 Webhook Triggers
```yaml
# webhooks.yaml
webhooks:
  # New blog post → Create social content
  - trigger: blog_published
    endpoint: /webhook/blog
    action: "Repurpose this blog post for Twitter, LinkedIn, and Instagram"

  # Customer signup → Request review
  - trigger: customer_signup
    endpoint: /webhook/signup
    action: "Add to review request queue for day 7"

  # Engagement spike → Alert team
  - trigger: engagement_spike
    endpoint: /webhook/viral
    action: "Alert team, suggest follow-up content"
```

---

## Phase 8: Monitoring & Analytics

### 8.1 Daily Health Check
OpenClaw runs automatic health checks:
```
6:00 AM Daily Report:
├── API Status: All connections ✓
├── Buffer Status: 7 days of content ready
├── Queue: 3 posts awaiting approval
├── Yesterday: 52 posts, 8.7K engagements
├── Trending: "data breach" spiking
└── Action: Created 5 trend-related posts
```

### 8.2 Metrics Tracked
| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Posts/day | Mixpost | <20 |
| Engagement rate | Platform APIs | <2% |
| Follower growth | Platform APIs | <1%/week |
| Buffer depth | Mixpost | <3 days |
| Queue depth | OpenClaw | >20 items |
| Error rate | OpenClaw logs | >5% |
| Response time | OpenClaw | >30 min avg |

### 8.3 Alert Configuration
```yaml
# alerts.yaml
alerts:
  - name: buffer-low
    condition: buffer_days < 3
    channels: [discord, email]
    message: "Content buffer running low! Only {buffer_days} days remaining."

  - name: engagement-drop
    condition: engagement_rate < 2%
    channels: [discord]
    message: "Engagement dropped to {rate}%. Review recent content."

  - name: viral-post
    condition: impressions > 10000
    channels: [discord, sms]
    message: "🔥 Viral alert! Post has {impressions} impressions."

  - name: error-spike
    condition: error_rate > 5%
    channels: [discord, email, sms]
    message: "⚠️ Error rate at {rate}%. Check system immediately."
```

---

## Phase 9: Security & Best Practices

### 9.1 API Key Security
```bash
# Never commit API keys
echo ".env" >> .gitignore

# Use environment variables
export ANTHROPIC_API_KEY=xxx

# Rotate keys quarterly
# Keep backup keys ready
```

### 9.2 Access Control
| Role | Discord Permissions | Actions |
|------|---------------------|---------|
| Admin | All | Full control |
| Content Manager | approve, reject, edit | Manage content |
| Viewer | stats, queue | Read-only |
| OpenClaw Bot | post | Automated posting |

### 9.3 Backup Strategy
```bash
# Daily backup of OpenClaw data
0 2 * * * docker exec openclaw tar -czf /backup/openclaw-$(date +%Y%m%d).tar.gz /data

# Weekly backup of Mixpost
0 3 * * 0 docker exec mixpost tar -czf /backup/mixpost-$(date +%Y%m%d).tar.gz /var/www/html/storage
```

### 9.4 Rate Limiting
```yaml
# rate-limits.yaml
platforms:
  twitter:
    posts_per_day: 50
    replies_per_hour: 20
  linkedin:
    posts_per_day: 5
    comments_per_hour: 10
  tiktok:
    videos_per_day: 5
  instagram:
    posts_per_day: 3
    stories_per_day: 10
```

---

## Quick Start Checklist

### Day 1: Core Setup
- [ ] Install Docker on Ubuntu
- [ ] Clone and configure OpenClaw
- [ ] Set up environment variables
- [ ] Run OpenClaw container
- [ ] Verify health check passes

### Day 2: Mixpost + Skills
- [ ] Install Mixpost via Docker
- [ ] Connect all social accounts to Mixpost
- [ ] Install Mixpost skill in OpenClaw
- [ ] Install marketing, browser, research skills
- [ ] Test: "Post 'Hello World' to Twitter via Mixpost"

### Day 3: Discord + Video
- [ ] Create Discord bot
- [ ] Invite bot to server
- [ ] Create channel structure
- [ ] Test Discord commands
- [ ] Configure HeyGen + ElevenLabs
- [ ] Test video generation

### Day 4: Automation
- [ ] Set up cron jobs
- [ ] Configure webhooks
- [ ] Set alert thresholds
- [ ] Create content templates
- [ ] Load brand voice into OpenClaw memory

### Day 5: Content Buffer
- [ ] Generate 7 days of content (N+7)
- [ ] Create 85 evergreen posts
- [ ] Set confidence threshold (85%)
- [ ] Test approval workflow
- [ ] Run 24-hour test

### Day 6: Go Live
- [ ] Enable all automation
- [ ] Monitor first day closely
- [ ] Tune confidence thresholds
- [ ] Document any issues
- [ ] Celebrate! 🎉

---

## Resources

- **OpenClaw Official:** https://openclaw.ai/
- **OpenClaw Docs:** https://docs.openclaw.ai/
- **Skills Registry:** https://github.com/VoltAgent/awesome-openclaw-skills
- **ClawHub Marketplace:** https://clawhub.ai/
- **Mixpost:** https://mixpost.app/
- **Mixpost Docs:** https://docs.mixpost.app/
- **Mixpost Skill:** https://clawhub.ai/lao9s/mixpost

---

## Estimated Costs (After Setup)

| Item | Monthly | Annual |
|------|---------|--------|
| Claude API | $200 | $2,400 |
| OpenAI (backup) | $20 | $240 |
| HeyGen | $30 | $360 |
| ElevenLabs | $22 | $264 |
| Resend | $20 | $240 |
| CapCut | $7.50 | $90 |
| ClickUp | $7.50 | $90 |
| Capsolver | $100 | $1,200 |
| **OpenClaw** | **$0** | **$0** |
| **Mixpost** | **$0** | **$0** |
| **TOTAL** | **$407** | **$4,884** |

**Savings vs. previous plan:** ~$1,700/year

---

## Notes

- OpenClaw runs 24/7 autonomously on your hardware
- All data stays on your servers (privacy-focused)
- Mixpost provides unlimited scheduling at no cost
- OpenClaw's persistent memory learns your brand voice over time
- Skills can be created automatically by OpenClaw as needed
- Browser automation allows posting to ANY platform

---

*Plan updated: February 4, 2026*
*Architecture: OpenClaw-Centric with Mixpost Integration*
