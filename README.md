# AI Video Automation

Generate AI videos using ZSky AI API, merge 6x10-second clips into 1-minute videos, upload to Catbox, and schedule automated posting - all running on **GitHub Actions**.

## Features

- **AI Video Generation** - 6 clips × 10 seconds = 1 minute video
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
│  │ Generate    │→ │ FFmpeg      │→ │ Upload to Catbox        │  │
│  │ 6 Clips     │  │ Merge       │  │ Get URL                 │  │
│  └─────────────┘  └─────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB PAGES (Frontend)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │ Video       │  │ Schedule    │  │ View Generated Videos   │  │
│  │ Player      │  │ Manager     │  │                         │  │
│  └─────────────┘  └─────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Fork or Use This Template

Click **"Use this template"** on GitHub to create your own copy.

### 2. Enable GitHub Actions

Go to your repository's **Actions** tab and enable workflows.

### 3. Generate Your First Video

1. Go to **Actions** tab
2. Click **"Manual Video Generation"** workflow
3. Click **"Run workflow"**
4. Enter a prompt or leave empty for random
5. Click **"Run workflow"**

### 4. Wait for the Video

The workflow will:
1. Generate 6 video clips (1-2 minutes)
2. Merge them into 1 video (about 1 minute)
3. Upload to Catbox (free hosting)
4. Create a GitHub Issue with the video URL

## Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| **Manual Video** | Button click | Generate video on-demand |
| **Scheduled Video** | Daily at 9 AM | Auto-generate daily video |
| **Video Pipeline** | API call | Full pipeline with notifications |

## Video Generation

- **Free Tier:** 50 videos/day from ZSky AI
- **Clip Duration:** 10 seconds max (free tier)
- **Total Video:** 6 clips × 10s = 60 seconds
- **Quality:** 1080p with audio

## Project Structure

```
ai-video-automation/
├── .github/
│   └── workflows/
│       ├── manual-video.yml      # On-demand generation
│       ├── scheduled-video.yml   # Daily auto-generation
│       └── video-pipeline.yml    # Full pipeline
├── scripts/
│   ├── generateClips.js          # ZSky AI integration
│   └── upload.js                 # Catbox upload
├── frontend/
│   ├── index.html                # Dashboard UI
│   ├── styles.css
│   └── app.js
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

# Generate video with custom prompt
npm run generate "A sunset over the ocean" 6

# Generate random video
npm run generate

# Upload to Catbox
npm run upload merged_video.mp4
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
3. In the dashboard (if configured)

## Free Tier Limits

| Service | Free Limit | Notes |
|---------|------------|-------|
| **ZSky AI** | 50 videos/day | 1080p, 10s per clip |
| **Catbox** | Unlimited | Files stored 72h (free) |
| **GitHub Actions** | 2000 min/month | Free tier |

## Troubleshooting

### Video Generation Fails
- Check ZSky API status at zsky.ai
- Verify daily limit not exceeded
- Check workflow logs for errors

### Upload Fails
- Catbox may have temporary issues
- Try again after a few minutes

### Workflow Timeout
- Increase timeout: `timeout-minutes: 30` in workflow file

## License

MIT
