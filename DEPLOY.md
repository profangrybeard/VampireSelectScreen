# Deploying to GitHub Pages with GitHub Actions

**For AI 201 Students — Spring 2026**

This guide walks you through deploying a Vite + React project to GitHub Pages using GitHub Actions. Once set up, your site automatically updates every time you push to `main`. No manual build or deploy steps.

---

## What is GitHub Actions?

GitHub Actions is automation built into GitHub. You write a small config file that says "when I push code, do these steps." GitHub runs those steps on their servers — install dependencies, build the project, deploy the result. You don't need to install anything or run any extra commands. Push your code, and the site updates.

The config file lives at `.github/workflows/deploy.yml` in your repo.

---

## How It Works (The 30-Second Version)

```
You push to main
    → GitHub sees the workflow file
    → Spins up a server with Node.js
    → Runs npm ci (install dependencies)
    → Runs npm run build (creates dist/ folder)
    → Publishes dist/ to GitHub Pages
    → Your site is live
```

Total time: ~1-2 minutes per push.

---

## Setup Steps

### Step 1: Make Sure Your Vite Config Has the Right Base Path

Open `vite.config.js`. The `base` property must match your GitHub repo name:

```js
export default defineConfig({
  plugins: [react()],
  base: '/YOUR-REPO-NAME/',  // ← Change this to your repo name
})
```

For example, if your repo is `github.com/yourname/hero-faction-screen`, set:
```js
base: '/hero-faction-screen/',
```

**Why?** GitHub Pages serves your site at `yourname.github.io/repo-name/`. Without the base path, all your asset links (CSS, JS, images) will point to the wrong location and your site will show a blank page.

### Step 2: Copy the Workflow File

Create the folder structure `.github/workflows/` in your repo root, then add `deploy.yml`:

```
your-project/
├── .github/
│   └── workflows/
│       └── deploy.yml    ← This file
├── src/
├── package.json
└── vite.config.js
```

You can copy the `deploy.yml` from this repo. It's heavily commented — read the comments to understand what each section does.

### Step 3: Enable GitHub Pages in Repo Settings

1. Go to your repo on GitHub
2. Click **Settings** (top nav, far right)
3. Click **Pages** (left sidebar, under "Code and automation")
4. Under **Source**, select **GitHub Actions**
5. That's it. No branch to select, no folder to configure.

### Step 4: Push Your Code

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push
```

### Step 5: Watch It Deploy

1. Go to your repo on GitHub
2. Click the **Actions** tab
3. You should see a workflow running called "Deploy to GitHub Pages"
4. Click on it to watch the progress
5. Green checkmark = deployed successfully

### Step 6: Find Your Live URL

Your site is live at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

You can also find this URL in:
- **Settings → Pages** (shows the published URL)
- **The Actions run** (the deploy step outputs the URL)

---

## The Workflow File, Annotated

Here's what each part of `deploy.yml` does:

```yaml
name: Deploy to GitHub Pages       # Name shown in the Actions tab
```

```yaml
on:
  push:
    branches: [main]               # Only runs when you push to main
                                   # (not on feature branches)
```

```yaml
permissions:
  contents: read                   # Can read your repo files
  pages: write                     # Can publish to Pages
  id-token: write                  # Authentication token for deployment
```

```yaml
concurrency:
  group: pages
  cancel-in-progress: true         # If you push twice fast, only deploy
                                   # the latest version
```

```yaml
- uses: actions/checkout@v4        # Downloads your repo code
- uses: actions/setup-node@v4      # Installs Node.js on the server
- run: npm ci                      # Installs your dependencies
                                   # (like npm install but faster/stricter)
- run: npm run build               # Runs vite build → creates dist/
- uses: actions/upload-pages-artifact@v3   # Packages dist/ for deployment
- uses: actions/deploy-pages@v4    # Publishes to GitHub Pages
```

---

## Common Gotchas

### Blank page after deploy
**Cause:** Wrong `base` path in `vite.config.js`.
**Fix:** Make sure it matches your repo name exactly, with leading and trailing slashes:
```js
base: '/your-repo-name/',
```

### Build fails in Actions but works locally
**Cause:** Usually a dependency issue or case-sensitive import (Linux is case-sensitive, Windows/Mac are not).
**Fix:** Check the Actions log for the exact error. Common culprits:
- Import `./Component` but file is `./component.jsx` (case mismatch)
- Missing dependency in `package.json` (installed globally on your machine but not in the repo)

### 404 on page refresh
**Cause:** Client-side routing (React Router) without server-side redirect.
**Fix:** For this project we don't use React Router, so this shouldn't apply. If you add routing later, you'll need a `404.html` redirect trick.

### Workflow never runs
**Cause:** The workflow file isn't on the `main` branch, or the filename/path is wrong.
**Fix:** The file must be at exactly `.github/workflows/deploy.yml` (or any `.yml` filename). Make sure it's committed and pushed to `main`.

### "Pages is not enabled" error
**Cause:** You skipped Step 3.
**Fix:** Go to Settings → Pages → set Source to "GitHub Actions."

---

## For Your Own Projects

1. Copy `.github/workflows/deploy.yml` into your repo
2. Set `base` in `vite.config.js` to `'/your-repo-name/'`
3. Enable Pages in Settings (Source: GitHub Actions)
4. Push to `main`
5. Done

---

*AI 201 Creative Computing with AI | Spring 2026 | SCAD Applied AI Degree Program*
