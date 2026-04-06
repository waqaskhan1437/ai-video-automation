# AI Video Automation

Generate AI videos using **Magic Hour API**, merge clips into 1-minute videos, upload to **Catbox**, and schedule automated posting - all running on **GitHub Actions**.

## Features

- **AI Video Generation** - Magic Hour API (6 clips × 5 seconds = 30 seconds)
- **Auto Merge** - FFmpeg merging via GitHub Actions
- **Catbox Upload** - Free file hosting
- **Scheduled Automation** - Daily, weekly, or on-demand
- **GitHub Pages Dashboard** - View generated videos
- **No Server Needed** - 100% serverless with GitHub Actions

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS (Backend)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │ Magic Hour  │→ │ FFmpeg      │→ │ Upload to Catbox        │  │
│  │ API Gen     │  │ Merge       │  │ Get URL                 │  │
│  └─────────────┘  └─────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB PAGES (Frontend)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │ Video       │  │ Schedule    │  │ View Generated Videos   │  │
│  │ Player      │  │ Manager     │  │ in GitHub Issues       │  │
│  └─────────────┘  └─────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Fork or Use This Template

Click **"Use this template"** on GitHub to create your own copy.

### 2. Get Magic Hour API Key (Required)

1. Go to: https://magichour.ai/settings/developer
2. Sign up / Login
3. Create a new API Key
4. Copy the key

### 3. Add API Key to GitHub Secrets

1. Go to your repository **Settings**
2. Click **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name: `MAGIC_HOUR_API_KEY`
5. Value: Paste your API key
6. Click **Add secret**

### 4. Enable GitHub Actions

Go to your repository's **Actions** tab and enable workflows.

### 5. Generate Your First Video

1. Go to **Actions** tab
2. Click **"Manual Video Generation"** workflow
3. Click **"Run workflow"**
4. Enter a prompt or leave empty for random
5. Click **"Run workflow"**

### 6. Wait for the Video

The workflow will:
1. Generate video clips using Magic Hour API (2-5 minutes)
2. Merge them into 1 video
3. Upload to Catbox (free hosting)
4. Create a GitHub Issue with the video URL

## Free Credits

| Service | Free Limit | Notes |
|---------|------------|-------|
| **Magic Hour** | 400 initial + 100/day | Requires signup |
| **Catbox** | Unlimited | Files stored 72h (free) |
| **GitHub Actions** | 2000 min/month | Free tier |

## Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| **Manual Video** | Button click | Generate video on-demand |
| **Scheduled Video** | Daily at 9 AM | Auto-generate daily video |
| **Video Pipeline** | API call | Full pipeline with notifications |

## Project Structure

```
ai-video-automation/
├── .github/
│   └── workflows/
│       ├── manual-video.yml      # On-demand generation
│       ├── scheduled-video.yml   # Daily auto-generation
│       └── video-pipeline.yml    # Full pipeline
├── scripts/
│   ├── generateClips.js          # Magic Hour API integration
│   └── upload.js                # Catbox upload
├── frontend/
│   ├── index.html                # Dashboard UI
│   └── styles.css
├── package.json
└── README.md
```

## Generate Videos Locally

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/ai-video-automation.git
cd ai-video-automation

# Install dependencies
npm install

# Set API key
export MAGIC_HOUR_API_KEY="your_api_key_here"

# Generate video with custom prompt
node scripts/generateClips.js "A beautiful sunset over the ocean" 6

# Generate random video
node scripts/generateClips.js

# Upload to Catbox
curl -F "reqtype=fileUpload" -F "fileToUpload=@merged_video.mp4" https://catbox.moe/user/api.php
```

## Dashboard

Open `frontend/index.html` in a browser to view the dashboard. You can also host it on GitHub Pages:

1. Go to **Settings > Pages**
2. Source: `main` branch, `/frontend` folder
3. Save

## Scheduling

### Daily (Default)
Scheduled to run every day at 9:00 AM UTC.

### Custom Schedule
Edit `.github/workflows/scheduled-video.yml`:

```yaml
on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM daily
    # Or: '0 */6 * * *'  # Every 6 hours
```

### Manual Trigger
Use the **Actions** tab to trigger manually anytime.

## Video URLs

All generated video URLs are saved:
1. In GitHub Issues (created automatically)
2. In workflow run logs
3. In the workflow summary

## Troubleshooting

### Video Generation Fails
- Check Magic Hour API key is correct
- Verify credits not exhausted
- Check workflow logs for errors
- Ensure API key is added to GitHub Secrets (not just environment variables)

### Upload Fails
- Catbox may have temporary issues
- Try again after a few minutes

### Workflow Timeout
- Generation can take 5-10 minutes per clip
- Magic Hour has queue times during peak hours

## Demo Mode

If you run the workflow without an API key, it will:
1. Create placeholder files
2. Show setup instructions
3. Create a GitHub Issue with setup guide

## License

MIT
