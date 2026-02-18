# Portfolio Intelligence

> AI-powered stock portfolio analysis — get real-time insights, sentiment analysis, and actionable recommendations based on the latest market news and fundamentals.

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-9+-F69220?style=flat-square&logo=pnpm&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Contract](#api-contract)
- [Development Notes](#development-notes)
- [Production Build](#production-build)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Portfolio Intelligence** is a single-page frontend application that lets investors analyse their stock portfolios using an AI-powered backend. Users enter their holdings (symbol + average buy price), select their exchange, investment horizon, and risk profile, and receive per-stock analysis cards covering news sentiment, fundamental impact, time-horizon outlook, valuation commentary, and recommended actions.

The frontend is a zero-dependency, vanilla TypeScript application bundled with Vite. It communicates with a separate backend REST API (not included in this repository).

---

## Features

- 📊 **Multi-stock analysis** — add/remove stocks dynamically with animated transitions
- 🌍 **Multi-exchange support** — NSE, BSE, NYSE, NASDAQ
- 🎯 **Configurable parameters** — investment horizon (short / medium / long term) and risk profile (low / moderate / high)
- 🤖 **AI-driven cards** — per-stock sentiment, market reaction, fundamental impact, time-horizon impact, valuation comment, recommended action, and invalidation triggers
- ⚡ **60-second request timeout** with user-friendly error messaging
- 🔒 **XSS-safe rendering** — all API data is HTML-escaped before injection
- 📱 **Fully responsive** — mobile-first layout built with Tailwind CSS v4

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5.9 (strict mode) |
| Bundler | Vite 7 |
| Styling | Tailwind CSS 4 |
| Linting | ESLint 9 + typescript-eslint 8 (flat config) |
| Package Manager | pnpm 9+ |
| Runtime target | ES2022 / modern browsers |

---

## Prerequisites

Ensure the following are installed before proceeding:

| Tool | Minimum Version | Install |
|---|---|---|
| Node.js | 20.0.0 | [nodejs.org](https://nodejs.org) |
| pnpm | 9.0.0 | `npm install -g pnpm` |

> **Backend required:** This frontend expects a running backend API at `http://localhost:8080` by default. See [Environment Variables](#environment-variables) to point it elsewhere.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dev-praveen/portfolio-analysis-app.git
cd portfolio-analysis-app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` if your backend runs on a different host or port (see [Environment Variables](#environment-variables)).

### 4. Start the development server

```bash
pnpm dev
```

The app will be available at **http://localhost:5173**.

> The Vite dev server automatically proxies all `/api/*` requests to the backend, so no CORS configuration is needed on the backend during development.

---

## Project Structure

```
portfolio-analysis-app/
├── public/                  # Static assets served as-is
├── src/
│   ├── api/
│   │   └── portfolioApi.ts  # Fetch wrapper — analyzePortfolio()
│   ├── renderer/
│   │   └── resultsRenderer.ts  # Pure functions: renderResults / renderError / renderLoading
│   ├── types/
│   │   └── portfolio.ts     # All TypeScript interfaces and union types
│   ├── app.ts               # App shell, state management, DOM wiring
│   ├── main.ts              # Entry point — mounts initApp()
│   └── style.css            # Tailwind base + custom keyframes
├── .env.example             # Environment variable documentation
├── eslint.config.ts         # ESLint flat config (typescript-eslint)
├── index.html               # HTML entry point
├── tsconfig.json            # TypeScript compiler options
├── vite.config.ts           # Vite config with dev proxy
└── package.json
```

---

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed. All variables are prefixed with `VITE_` so Vite inlines them at build time.

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL of the backend API. In development the Vite proxy uses this value; in production it is inlined into the bundle. |

> **Never commit your `.env` file.** It is listed in `.gitignore`. Only `.env.example` should be committed.

### Development vs Production behaviour

| Environment | How API calls are routed |
|---|---|
| `pnpm dev` | Browser → `localhost:5173/api/*` → **Vite proxy** → `VITE_API_BASE_URL/api/*` (no CORS) |
| `pnpm build` | `VITE_API_BASE_URL` is inlined at build time; requests go directly to the configured origin |

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `pnpm dev` | Start Vite dev server with HMR at `localhost:5173` |
| Production build | `pnpm build` | Type-check with `tsc`, then bundle with Vite |
| Preview build | `pnpm preview` | Serve the production `dist/` folder locally |
| Lint | `pnpm lint` | Run ESLint across `src/` (zero warnings policy) |
| Lint & fix | `pnpm lint:fix` | Run ESLint with `--fix` to auto-correct fixable issues |
| Type check | `pnpm type-check` | Run `tsc --noEmit` without bundling |
| Test | `pnpm test` | Run the test suite |

---

## API Contract

The frontend calls a single endpoint:

```
POST /api/portfolio/analyze?exchange=NSE&horizon=MEDIUM_TERM&riskProfile=MODERATE
Content-Type: application/json
```

**Request body:**
```json
{
  "symbolAndAveragePriceList": [
    { "symbol": "RELIANCE", "avgBuyPrice": "2800.50" },
    { "symbol": "INFY",     "avgBuyPrice": "1450.00" }
  ]
}
```

**Query parameters:**

| Parameter | Type | Values |
|---|---|---|
| `exchange` | string | `NSE` \| `BSE` \| `NYSE` \| `NASDAQ` |
| `horizon` | string | `SHORT_TERM` \| `MEDIUM_TERM` \| `LONG_TERM` |
| `riskProfile` | string | `LOW` \| `MODERATE` \| `HIGH` |

**Response:** `200 OK` — array of `PortfolioAnalysisResponse` objects (see `src/types/portfolio.ts` for the full interface).

---

## Development Notes

- **Strict TypeScript** — `strict: true` plus `noUnusedLocals`, `noUnusedParameters`, and `verbatimModuleSyntax` are all enabled. Avoid `any`; use `unknown` with type guards.
- **Named exports only** — default exports are not used anywhere in `src/`.
- **No UI framework** — the app uses vanilla DOM APIs intentionally to keep the bundle small and dependency-free.
- **XSS safety** — all API-sourced strings are passed through `escHtml()` before being set as `innerHTML`. Validation error messages use `textContent` / `createTextNode`.
- **Request timeout** — `analyzePortfolio` uses an `AbortController` with a 60-second timeout. Adjust `REQUEST_TIMEOUT_MS` in `src/api/portfolioApi.ts` if needed.

---

## Production Build

```bash
# 1. Set the production API URL in your CI/CD environment
export VITE_API_BASE_URL=https://api.your-domain.com

# 2. Build
pnpm build

# 3. Output is in dist/ — deploy to any static host (Vercel, Netlify, S3, Nginx, etc.)
```

The build output is fully static (HTML + CSS + JS). No server-side rendering is required.

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes, ensuring `pnpm build` and `pnpm lint` both pass with zero errors/warnings
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, etc.
4. Open a pull request against `master` with a clear description of the change

---

## License

This project is private and not licensed for public distribution.
