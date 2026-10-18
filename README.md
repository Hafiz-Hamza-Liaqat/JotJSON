# JotJSON

> **Format. Inspect. Compare.**  
> Version: 1.0.0  
> License: MIT

JotJSON is a fast, local-first developer toolkit designed for validating, formatting, comparing, and searching JSON documents entirely within the browser. It runs with zero backend, zero registration, and zero third-party telemetry or cloud APIs. All parsing and operations execute in client memory, ensuring sensitive data, API payloads, configurations, and tokens never leave your machine.

---

## Features

### Workspace A: Format & Validate (Default)
- **Strict JSON Validation:** Validates standard RFC 8259 JSON, rejecting trailing commas, comments, and unquoted/single-quoted keys. Root primitives (`true`, `false`, `null`, numbers, strings) are supported.
- **Diagnostics with Exact Positions:** Reports 1-based line and column diagnostics along with character offsets for precise troubleshooting.
- **Visual Error Highlighting:** Highlighting directly in the CodeMirror 6 editor gutter and error lines, automatically scrolling to the error location.
- **Source-Preserving Formatting:** Indentation options include 2 spaces, 4 spaces, or tabs. Preserves string contents, escaped characters, exponent notation, and object key order.
- **Token-Aware Minification:** Strips insignificant whitespace between tokens without modifying whitespace within strings or altering exact numeric representations.
- **Live UTF-8 Document Statistics:** Computes true UTF-8 byte length (not UTF-16 code units), line count, total nested object key count, and maximum nesting depth.
- **Stale State Management:** When input is edited after an operation, output and statistics are flagged as stale until re-run.

### Workspace B: Compare JSON
- **Structural Diff Engine:** Compares two independently editable JSON documents structurally, ignoring object-key order and formatting whitespace differences.
- **Difference Categories:** Highlights added properties, removed properties, and changed values with clear badges.
- **Arbitrary Numeric Precision:** Handles arbitrarily large numbers (beyond JavaScript's `Number.MAX_SAFE_INTEGER`, such as `9007199254740993`) without float precision loss. Normalizes decimal equivalents (e.g. `1`, `1.0`, `1e0`) without destructive type coercion.
- **Unambiguous JSONPath Locations:** Generates safe JSONPath strings (e.g. `$["profile"]["display.name"]`, `$["items"][0]`) escaping dots, quotes, and special characters.
- **Copy Utilities:** One-click copy for difference paths, original values, and modified values.

### Workspace C: Search JSON
- **Deep Nested Search:** Traverses arbitrary structures to search object keys, string values, numeric tokens, booleans, and nulls.
- **Flexible Scope:** Search keys only, primitive values only, or both simultaneously.
- **Partial & Case-Insensitive Matching:** Matches sub-strings efficiently without requiring explicit quote characters for strings.
- **Display Limit & Safety:** Caps displayed UI items at 100 matches while reporting the true total match count, preventing DOM rendering freezes on huge payloads.

### Privacy & Data Integrity
- **100% Client-Side:** No remote servers, authentication, databases, or AI APIs.
- **Zero Content Persistence:** JSON documents are strictly stored in component memory during your active session. They are never written to `localStorage`, `sessionStorage`, or `IndexedDB`.
- **Saved Theme Preference:** The only value persisted to `localStorage` is your theme toggle (`dark` or `light`).
- **5 MiB Safety Limit:** Enforces an application-level document size limit (5 MiB) to preserve responsive browser performance.

---

## Technology Stack

- **Framework:** React 19 + TypeScript (strict mode enabled)
- **Bundler & Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4 with custom dark mode variants and design tokens
- **Code Editor:** CodeMirror 6 via `@uiw/react-codemirror` and `@codemirror/lang-json`
- **JSON Parsing & AST:** `jsonc-parser` (configured strictly with `disallowComments: true` and `allowTrailingComma: false`)
- **Icons:** Lucide React
- **Unit & Component Tests:** Vitest 5 + React Testing Library + `@testing-library/jest-dom` + `jsdom`
- **End-to-End Tests:** Playwright 1.64
- **Linters:** Oxlint + ESLint 10

---

## Screenshots

To capture real screenshots of the application:
1. Run the development server with `npm run dev` and navigate to `http://localhost:5173`.
2. Capture the default **Format & Validate** workspace after clicking **Load sample** and **Format**.
3. Capture the **Compare JSON** workspace with active diff results.
4. Capture the **Search JSON** workspace with query results.
5. Save captured images into `src/assets/` or `docs/screenshots/`.

---

## Installation & Setup

### Prerequisites
- **Node.js:** LTS version 20.x or 22.x recommended (verified with Node.js 22).
- **npm:** version 10.x or later.

### Install dependencies
```bash
npm install
```

---

## Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite development server at `http://localhost:5173` |
| `npm run build` | Runs TypeScript project build (`tsc -b`) and bundles for production with Vite |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs Oxlint and ESLint across the codebase |
| `npm run typecheck` | Validates TypeScript types across source files and tests without emitting files |
| `npm test` | Starts Vitest in interactive watch mode |
| `npm run test:run` | Runs all Vitest unit and component tests once |
| `npm run test:e2e` | Runs Playwright browser end-to-end test suite |
| `npm run check` | Runs lint, typecheck, and unit/component tests in sequence |

---

## Deployment Instructions

### GitHub Pages

JotJSON includes ready-to-use GitHub Actions workflows under `.github/workflows/`:
- **`ci.yml`**: Runs linting, type checks, unit tests, and production build on pull requests and pushes to `main`.
- **`pages.yml`**: Automatically builds and deploys the static application to GitHub Pages on pushes to `main`.

#### Enabling GitHub Pages on your repository:
1. Push this repository to GitHub under your user/organization account.
2. In your repository on GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
4. The `.github/workflows/pages.yml` workflow will trigger on the next push or manual dispatch.
5. If deploying under a custom repository name other than `jotjson`, adjust the `BASE_PATH` environment variable in `.github/workflows/pages.yml` or set `BASE_PATH=/<repo-name>/` in the repository settings.

### Vercel / Netlify / Static Hosts

Because JotJSON is a static single-page application (SPA), it can be deployed to any static host:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- No serverless functions or environment secrets are required.

---

## JSON Processing & Data Integrity Details

1. **Large Number Precision:** Standard `JSON.parse` converts numbers to 64-bit IEEE 754 floating-point values, which rounds integers exceeding $2^{53} - 1$ (e.g. `9007199254740993` becomes `9007199254740992`). JotJSON extracts raw numeric tokens from the syntax tree and normalizes signs, digits, and exponents algebraically, comparing exact numeric identity without precision loss.
2. **Safe Whitespace Minification:** Rather than using regular expressions that could corrupt spaces or escaped quotes inside strings, JotJSON uses a token-level scanner to isolate trivia and retain string literals intact.
3. **Escaped Keys in JSONPath:** Property names with spaces, dots, or symbols are enclosed in bracketed strings (e.g. `$["key.with.dots"]`), ensuring generated JSONPaths remain valid and unambiguous.

---

## Limitations

- **File Size Limit:** An application-level limit of 5 MiB per file is enforced. Documents larger than 5 MiB are rejected before parsing to prevent locking the browser's UI thread.
- **Strict JSON Standard:** JSON with comments (JSONC), trailing commas, unquoted keys, or single quotes is flagged as invalid syntax by design.

---

## Project Structure

```
jotjson/
├── .github/
│   └── workflows/
│       ├── ci.yml            # CI validation workflow
│       └── pages.yml         # GitHub Pages static deploy workflow
├── public/
│   └── favicon.svg           # Application favicon
├── src/
│   ├── app/
│   │   └── App.tsx           # Main workspace orchestration & shell
│   ├── assets/
│   │   └── hero.png          # Documentation asset
│   ├── components/
│   │   ├── AppHeader.tsx     # Branding, privacy badge, workspace navigation
│   │   ├── CopyButton.tsx    # Clipboard interaction with feedback
│   │   ├── EditorToolbar.tsx # File upload, clear, and action controls
│   │   ├── EmptyState.tsx    # Accessible empty state guidance
│   │   ├── JsonEditor.tsx    # CodeMirror 6 wrapper with error highlighting
│   │   ├── StatisticsRow.tsx # Document size, line count, keys, and depth
│   │   ├── StatusMessage.tsx # Accessible alert & status banners
│   │   ├── ThemeToggle.tsx   # Dark/light theme switcher
│   │   └── WorkspaceTabs.tsx # Accessible tab navigation
│   ├── data/
│   │   └── sampleJson.ts     # Sample JSON datasets for demonstration
│   ├── features/
│   │   ├── compare/          # Workspace B: Compare features and diff list
│   │   ├── format/           # Workspace A: Format, minify, and validate
│   │   └── search/           # Workspace C: Key and value nested search
│   ├── hooks/
│   │   └── useTheme.ts       # Theme state and persistence hook
│   ├── lib/
│   │   ├── browser/          # Clipboard, download, and file reader utilities
│   │   ├── json/             # Validation, comparison, formatting, statistics, decimal math
│   │   └── text/             # Line and position calculation helpers
│   ├── styles/
│   │   └── index.css         # Tailwind CSS imports and custom utility classes
│   └── main.tsx              # Application entry point
├── tests/
│   ├── components/           # React Testing Library component integration tests
│   ├── e2e/                  # Playwright browser end-to-end tests
│   └── unit/                 # Vitest unit test suite
├── eslint.config.js          # ESLint configuration
├── package.json              # Package manifest and npm scripts
├── playwright.config.ts      # Playwright end-to-end configuration
├── tsconfig.json             # TypeScript root project configuration
└── vite.config.ts            # Vite bundler & Vitest configuration
```

---

## Contributing

1. Fork and clone the repository.
2. Install dependencies with `npm install`.
3. Create a feature branch: `git checkout -b feature/my-feature`.
4. Run `npm run check` to ensure all linters, type checks, and tests pass.
5. Submit a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).
