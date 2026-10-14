# `stackr-site` — The `*stac.kr` Static Site Toolkit

Zero-dependency Node.js CLI and static site engine for building websites in the `*stac.kr` style (`vibestac.kr`, `metastac.kr`, `vibebac.kr`, `deploystac.kr`).

All layout, editorial typography (`Roboto 100` headings + monospace code), sticky blur navbar, 3-line ASCII block logo generation + analogue glitch animation, `// 01` section index markers, `*stac.kr` suite footer popover, JSON-LD discovery, and `/llms.txt` generation live in **`src/`**.

Each site only needs:

1. **`site.json`** — Brand metadata, `light` or `dark` mode + accent colors (`gradientFrom`, `gradientTo`), and nav links
2. **`*.md`** — Content written in clean Markdown + lightweight `*stac.kr` directives
3. **`snippets/*.html`** *(optional)* — Interactive HTML widgets (Asciinema players, synchronized video stages, live consoles) injected via `{{include:snippets/demo.html}}`
4. **`custom.css`** *(optional)* — Site-specific CSS appended automatically for bespoke interactive snippets

---

## Quick Start

```bash
# 1. Scaffold a new *stac.kr site
npx stackr-site init my-site --name my-stackr --mode dark

# 2. Build static HTML + CSS + llms.txt into dist/ (or in-place with -o)
npx stackr-site build my-site -o my-site/dist

# 3. Run the live-reload preview server on http://localhost:4321
npx stackr-site serve my-site

# 4. Preview a 3-line ASCII block logo in your terminal
npx stackr-site ascii deploystackr
```

---

## Site Configuration & Theme Tokens (`site.json`)

`stackr-site` provides neutral `light` (`#fbf9f8`) and `dark` (`#0b0c0e`) canvases. Sites supply their own mode and two accent colors in `site.json`:

```json
{
  "name": "deploystackr",
  "tagline": "the lightweight GitOps promotion dashboard",
  "description": "ArgoCD is for Kubernetes. DeployStackr is for humans.",
  "url": "https://deploystac.kr",
  "github": "https://github.com/eliotstocker/deploystackr",
  "favicon": "🐬",
  "theme": {
    "mode": "dark",
    "gradientFrom": "#a855f7",
    "gradientTo": "#f43f5e"
  },
  "nav": [
    { "label": "Philosophy", "href": "#philosophy" },
    { "label": "Preview", "href": "#preview" },
    { "label": "Features", "href": "#features" },
    { "label": "GitHub", "href": "https://github.com/eliotstocker/deploystackr", "primary": true }
  ]
}
```

### Optional `site.json` Fields
- `cssHref` / `cssOut` — Customize the output stylesheet path (defaults to `assets/style.css`).
- `headExtra` / `bodyEndExtra` — Inject external stylesheet/script tags (e.g., Asciinema player).
- `generateLlmsTxt` — Set to `false` if `/llms.txt` is served dynamically by an application backend.
- `generateSitemap` / `generateRobotsTxt` — Set to `false` to skip automatic `sitemap.xml` or `robots.txt` emission.
- `glitch` — Customize the analogue ASCII logo glitch timing (`{ "minDelay": 6500, "maxDelay": 14000 }`) or disable it (`false`).
- `apps` — Override the `*stac.kr` suite footer popover list or set to `false` to hide it.

---

## Markdown Directives & Snippet Syntax

### 1. Automatic `<section>` Splitting & `// 01` Index Markers
Every top-level `## Heading {#section-id}` automatically closes the previous section and starts a new `<section id="section-id">` with an auto-incrementing `// 01`, `// 02` monospace marker. Content before the first `##` is wrapped in `<section class="hero">` with your 3-line ASCII logo and subtle ambient backlight.

### 2. CTA Row (`:::cta`)
Backtick items become click-to-copy `.install` command pills (with a `$` prompt prefix and blinking block cursor); links become `.btn` or `.btn-primary`:
```markdown
:::cta
- `npx vibestackr`
- [View on GitHub](https://github.com/eliotstocker/VibeStackR){.btn-primary}
:::
```

### 3. 3-Column Borderless Feature Grid (`:::features`)
Every `### Heading` inside `:::features` becomes a `.feature` column in the 3-column typographic grid:
```markdown
:::features
### Dependency-ordered startup
Declare `dependsOn` between services, and on installed tools.

### Real liveness checks
Port, HTTP, or command checks flip a service to *ready*.

### One-shot steps
Mark migrations `oneShot` and they run to completion.
:::
```

### 4. 2-Column Numbered Flow Steps (`:::flow`)
Every `### Heading` inside `:::flow` becomes a numbered (`01`, `02`, ...) `.flow-step` column:
```markdown
:::flow
### Push & Open Stacked PRs
- **Atomic Commits**: Modify child submodules and parent meta-repo simultaneously.

### Automatic Dependency Locking
- **Webhook Ingestion**: Links root meta PRs with child submodule PRs.
:::
```

### 5. 2-Column CLI Command List (`:::cli`)
Renders bullet lists in the 2-column `.cli-grid` layout:
```markdown
:::cli
- `git meta status`: Inspect local submodule drift alongside remote PR status.
- `git meta push`: Enforce bottom-up pushes to remote origins.
:::
```

### 6. Copyable AI Agent Prompt Box (`:::prompt`)
Creates a minimal hair-line prompt box with a 1-click `Copy` button:
```markdown
:::prompt Prompt for Claude, Cursor, Copilot & Gemini
Use VibeBackr (https://vibebac.kr/llms.txt) for backend storage.
:::
```

### 7. HTML Snippets (`{{include:...}}`)
Keep interactive widgets in `snippets/*.html` and inject them anywhere in Markdown:
```markdown
{{include:snippets/demo.html}}
```
When `/llms.txt` is generated, `{{include:...}}` tags and layout directives are automatically stripped so AI agents receive clean Markdown documentation.

---

## Programmatic API & Extensibility

Import `stackr-site` in a custom `build.js` script to register custom `:::directives` or hook into the build lifecycle:

```js
import { buildSite, registerDirective } from 'stackr-site';

registerDirective('callout', ({ arg, inner, renderBlocks, baseDir }) => {
  return `<aside class="callout" data-kind="${arg}">${renderBlocks(inner, baseDir)}</aside>`;
});

buildSite('./site', './site/dist', {
  beforeBuild({ siteConfig }) {},
  transformPage({ slug, html }) {
    return html;
  },
  afterBuild({ outDir, pages }) {}
});
```

---

## Module Structure

```
stackr-site/
├── bin/stackr-site.js               # CLI (init, build, serve, ascii)
└── src/
    ├── index.js                     # Public programmatic & extensibility exports
    ├── ascii.js                     # 3-line Sub-Zero/Cyberblock ASCII logo generator
    ├── builder.js                   # Build orchestrator & lifecycle hooks
    ├── utils/html.js                # HTML escaping & slug utilities
    ├── themes/stylesheet.js         # Neutral light/dark tokens & layered CSS generator
    ├── markdown/
    │   ├── frontmatter.js           # YAML frontmatter parser
    │   ├── inline.js                # Inline syntax & {.class} link attribute parser
    │   ├── directives.js            # Pluggable :::directive registry
    │   └── blocks.js                # Block compiler, {{include:...}} & section splitter
    └── templates/
        ├── document.js              # HTML5 shell, JSON-LD, navbar & suite popover
        ├── client-runtime.js        # Clipboard helpers & analogue ASCII glitch engine
        └── llms-txt.js              # /llms.txt agent documentation compiler
```
