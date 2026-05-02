# TSB Site — Deployment Guide
## myscienceblueprint.com | Cloudflare Pages + GitHub

---

## Step 1: Create the GitHub Repository

1. Go to github.com and log in
2. Click **New repository** (the green button, top-right)
3. Repository name: `science-blueprint-site`
4. Visibility: **Public** (required for free Cloudflare Pages deploys)
5. Do NOT initialise with README — leave it empty
6. Click **Create repository**
7. Copy the repo URL: `https://github.com/YOUR_USERNAME/science-blueprint-site.git`

---

## Step 2: Push the Site Files to GitHub

Open your terminal (Git Bash / CMD / PowerShell) in the folder containing all the site files, then run:

```bash
git init
git add .
git commit -m "chore: initial TSB site build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/science-blueprint-site.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 3: Connect to Cloudflare Pages (Already Done — Verify)

Since Cloudflare Pages is already tracking `science-blueprint-site/main`, any push to `main` will trigger an automatic deployment within 30–60 seconds.

To verify:
1. Log in to dash.cloudflare.com
2. Go to **Workers & Pages** → **science-blueprint-site**
3. Confirm the latest deployment shows a green ✓ status

---

## Step 4: Set Up the Tally Contact Form

1. Go to tally.so and log in with **marvin@myscienceblueprint.com**
2. Click **New Form**
3. Add these fields:
   - **Name** (Short text, required)
   - **Email** (Email, required)
   - **Subject** (Dropdown: Research Collaboration / Press & Media / General Enquiry / Student Outreach / Other)
   - **Message** (Long text, required)
4. Go to **Share → Embed** → copy the embed URL (looks like `https://tally.so/embed/XXXXXXXX`)
5. Open `contact.html` in a text editor
6. Find this line:
   ```
   src="https://tally.so/embed/placeholder?hideTitle=1&transparentBackground=1&dynamicHeight=1"
   ```
7. Replace `placeholder` with your actual form ID from step 4
8. Save the file and push to GitHub:
   ```bash
   git add contact.html
   git commit -m "feat: add tally contact form"
   git push
   ```

---

## Step 5: Update stats.json Periodically

When your numbers grow, edit `data/stats.json`:

```json
{
  "youtube_subscribers": 6,
  "zenodo_publications": 2,
  "linkedin_connections": 8,
  "substack_readers": 0,
  "last_updated": "2026-05-01"
}
```

Then push the change — the homepage stats strip will update automatically.

---

## Step 6: Update videos.json When You Upload a New Video

Edit `data/videos.json` and add a new entry:

```json
{
  "id": "YOUR_YOUTUBE_VIDEO_ID",
  "title": "Your Video Title",
  "description": "A brief description.",
  "date": "2026-05-XX",
  "thumbnail": "https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg"
}
```

The YouTube Video ID is the `v=XXXXXX` part in the YouTube URL.

---

## File Structure

```
science-blueprint-site/
├── index.html          ← Homepage
├── archive.html        ← The Archive (publications)
├── about.html          ← About / Founder
├── signal.html         ← The Signal (YouTube + Substack)
├── contact.html        ← Contact (Tally form)
├── 404.html            ← Custom error page
├── _redirects          ← Cloudflare Pages routing
├── assets/
│   ├── logo.png        ← TSB logo (cyan/magenta)
│   └── profile.webp    ← Founder photo
├── css/
│   └── style.css       ← Full design system
├── js/
│   ├── main.js         ← Nav, theme, scroll, RSS
│   └── particles.js    ← Hero node animation
└── data/
    ├── stats.json      ← Live stats (update manually)
    ├── publications.json ← Publication data
    └── videos.json     ← YouTube video list
```

---

## Troubleshooting

**Fonts not loading?**
The site uses Google Fonts. Ensure you're online; fonts load from `fonts.googleapis.com`.

**Particle animation not showing?**
Open browser console (F12). If you see a canvas error, try a hard refresh (Ctrl+Shift+R).

**Substack feed not loading?**
The RSS proxy (api.rss2json.com) has a rate limit on the free tier. This is fine for low traffic.
If it breaks, the site gracefully falls back to a placeholder message.

**Dark/light mode not persisting?**
Check that localStorage is not blocked in your browser.

---

*Last updated: May 2026 · TSB-WEB-2026-v1.0*
