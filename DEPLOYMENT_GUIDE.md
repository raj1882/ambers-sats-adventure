# 🚀 Deployment Guide — Amber's SATs Adventure

## Quick Start (5 Minutes)

### Option 1: GitHub Pages (Free, Recommended for Beginners)

**Step 1 — Install dependencies**
```bash
cd ambers-sats-adventure
npm install react-router-dom
npm install --save-dev gh-pages
```

**Step 2 — Update package.json**
```json
{
  "name": "ambers-sats-adventure",
  "version": "1.0.0",
  "homepage": "https://YOUR_USERNAME.github.io/ambers-sats-adventure",
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "react-scripts": "5.0.1",
    "typescript": "^5.4.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

**Step 3 — Add SPA routing support**
Create `public/404.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting</title>
  <script>
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='/'">
</head>
<body></body>
</html>
```

Add to `public/index.html` inside `<head>`:
```html
<script>
  (function() {
    const redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect !== location.href) {
      history.replaceState(null, null, redirect);
    }
  })();
</script>
```

**Step 4 — Deploy**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ambers-sats-adventure.git
git push -u origin main

npm run deploy
```

**Step 5 — Enable GitHub Pages**
Go to repo Settings → Pages → Source: Deploy from branch → Select `gh-pages` → Save.

Your app will be live at: `https://YOUR_USERNAME.github.io/ambers-sats-adventure`

---

### Option 2: Netlify (Free, Better for Custom Domains)

**Step 1 — Build the app**
```bash
npm run build
```

**Step 2 — Drag & drop deploy**
1. Go to [netlify.com](https://netlify.com)
2. Drag the `build/` folder onto the Netlify dashboard
3. Get instant live URL

**Or connect Git for auto-deploy:**
1. Push code to GitHub
2. Connect repo in Netlify dashboard
3. Build command: `npm run build`
4. Publish directory: `build`
5. Auto-deploys on every push to `main`

**For SPA routing, add `public/_redirects`:**
```
/*    /index.html   200
```

---

### Option 3: Vercel (Free, Best Performance)

**Step 1 — Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 2 — Deploy**
```bash
vercel --prod
```

Vercel auto-detects Create React App. For SPA routing, create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Platform Comparison for This Project

| Platform | Cost | Setup | Custom Domain | Best For |
|---|---|---|---|---|
| **GitHub Pages** | Free | 10 min | Yes (free) | Beginners, open source |
| **Netlify** | Free | 5 min | Yes (free) | Custom domains, forms |
| **Vercel** | Free | 3 min | Yes (free) | Performance, Next.js |
| **Cloudflare Pages** | Free | 5 min | Yes (free) | Unlimited bandwidth |

**Recommendation for Amber:** Use **GitHub Pages** — it's free, permanent, and tied to your GitHub account. Perfect for a personal revision tool that doesn't need a backend.

---

## Post-Deploy Checklist

- [ ] App loads at deployed URL
- [ ] Land Selection screen visible
- [ ] Can click into Forest of Fractions
- [ ] Number pad works on mobile
- [ ] Answer a question → refresh → progress preserved
- [ ] Close tab → reopen → ResumeModal appears
- [ ] Zero-Trap Alert triggers on 504 (24×36)
- [ ] Hint Card slides up correctly
- [ ] Mountain Climber updates after correct answer
- [ ] Golden Calculator tracks across sessions

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "404" on refresh | Add `404.html` SPA redirect (see Step 3) |
| Blank page after deploy | Check `homepage` in package.json matches repo name |
| localStorage not persisting | Check browser isn't in private/incognito mode |
| ResumeModal not showing | Session > 2 hours old = stale. Clear localStorage to test. |
| Fonts not loading | Ensure Google Fonts link is in `public/index.html` |

---

## Updating the App

After making changes:
```bash
git add .
git commit -m "Update: [description]"
git push origin main
npm run deploy
```

GitHub Pages updates in ~1-2 minutes.
