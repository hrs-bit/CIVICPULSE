# CivicPulse AI — Deployment Guide

This app classifies citizen complaints entirely **in the browser** using a
keyword-based rules engine (see `classifyLocally()` in `src/App.jsx`). There
is no API key, no backend, and no external network calls — it's a fully
static site, which means it deploys directly to GitHub Pages with no setup
beyond pushing the code.

## 1. Push to GitHub

```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<your-repo-name>.git
git push -u origin main
```

If your repo name is NOT `civicpulse`, update `base` in `vite.config.js` to
match: `base: "/your-repo-name/"`.

## 2. Turn on GitHub Pages

1. In your repo on GitHub: **Settings → Pages**.
2. Under "Build and deployment", set **Source** to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) runs automatically
   on push, builds the app, and deploys it.
4. Once the workflow finishes (check the **Actions** tab), your site is live
   at:
   ```
   https://<you>.github.io/<your-repo-name>/
   ```

That's it — no keys, no secrets, no third-party accounts.

## Local development

```
npm install
npm run dev
```

Runs the app at `http://localhost:5173`, fully functional immediately.

## How classification works

`classifyLocally()` in `src/App.jsx` matches complaint text against keyword
lists in `CATEGORY_RULES` to pick a category and department, then applies
simple heuristics for urgency, sentiment, and resolution time. Tune the
keyword lists there to improve accuracy for your city's typical complaints.

## Costs

Free. GitHub Pages hosting for public repos costs nothing, and there's no
API usage to pay for.

## Upgrading to real AI later

If you ever want true language-model classification instead of keyword
rules, you'd need a small server-side proxy to hold an API key safely (a
Cloudflare Worker, Vercel function, etc.) — a static GitHub Pages site can't
hide a secret key on its own. That's a bigger step than this project needs
today, so it's left out for now.
