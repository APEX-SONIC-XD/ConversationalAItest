# DriveClear

A static demo site for **DriveClear** — a transparent used-car shopping experience with a conversational AI widget.

## Live site

Once GitHub Pages is enabled (see below), the site will be available at:

**https://apex-sonic-xd.github.io/ConversationalAItest/**

## Project structure

```
.
├── index.html          # Home page
├── srp.html            # Search Results Page (inventory listing)
├── vdp.html            # Vehicle Detail Page
├── css/
│   └── styles.css
└── js/
    ├── app.js          # Page logic / rendering
    ├── inventory.js    # Mock inventory data
    └── widget.iife.js  # Embedded conversational AI widget
```

## Run locally

It's pure static HTML/CSS/JS — open `index.html` directly, or serve the folder:

```bash
# Python 3
python -m http.server 8000

# Node (npx)
npx serve .
```

Then visit http://localhost:8000.

## Enabling GitHub Pages

In this repo on GitHub:

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set **Branch** to `main` and folder to `/ (root)`, then click **Save**.
4. Wait ~30–60 seconds, then open the URL above.

The empty `.nojekyll` file in the repo root tells GitHub Pages to skip Jekyll processing and serve the files as-is.
