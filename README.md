# Taylor Series Visualizer 🎓

An interactive educational single-page web app for Numerical Methods classes. It interactively teaches how Taylor polynomials progressively approximate functions, one derivative/term at a time, featuring high-contrast academic aesthetics (Royal Maroon `#800020` and Luminous Amber `#D97706`), progressive curve animations, ghost trace comparisons, KaTeX mathematical typesetting, and symbolic differentiation via `mathjs`.

---

## ✨ Features

- **Classroom-Ready Theme**: Projector-friendly maroon and gold palette with large readable fonts and generous spacing.
- **Progressive Derivative Reveal**:
  - Starts at order 0 ($f(a)$ constant).
  - "Reveal Next Derivative" button with satisfying micro-interactions and milestone confetti bursts.
  - Automatically calculates symbolic derivatives $f^{(n)}(x)$, evaluates coefficients $\frac{f^{(n)}(a)}{n!}$, and formats the running polynomial $P_n(x)$.
  - Caps at order 10 with reset and step-back capabilities.
- **Modern, Presentable Graph (Plotly.js)**:
  - **Original Curve $f(x)$**: Royal Maroon line (`#800020`, 3.5px).
  - **Current Taylor Curve $P_n(x)$**: Luminous Amber Gold (`#D97706`, 3.5px) with snappy progressive draw-in animation (~340ms).
  - **Ghost Curve $P_{n-1}(x)$**: Muted dashed curve showing previous approximation level.
  - **Interactive Error Area**: Optional HUD toggle highlighting the approximation residual region $|f(x) - P_n(x)|$.
  - **Expansion Anchor Marker**: Distinct marker at $(a, f(a))$.
  - Built-in pan, box zoom, hover tooltip inspections, and fixed domain comparison.
- **Accessibility**: Automatically detects and respects `prefers-reduced-motion`.
- **Pure Client-Side**: No servers or database needed. Runs 100% in browser.

---

## 🚀 Quick Start (Run Locally)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel in 3 Steps

This project is built with Next.js App Router and requires **zero custom configuration or environment variables** to deploy to Vercel.

### Step 1: Initialize Git and Commit
```bash
git init
git add .
git commit -m "feat: initial Taylor Series Visualizer"
```

### Step 2: Push to GitHub
Create a new empty repository on [GitHub](https://github.com/new), then run:
```bash
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git branch -M main
git push -u origin main
```

### Step 3: Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your repository and click **Import**.
3. Leave all default settings unchanged (Framework: Next.js) and click **Deploy**.

Your app is now live!
