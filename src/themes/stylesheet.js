/**
 * Generates the unified, ultra-minimal *stac.kr stylesheet from site-supplied theme tokens.
 * Sites supply `{ mode: "light" | "dark", gradientFrom, gradientTo, ... }` in `site.json`;
 * stackr-site only provides neutral light/dark base defaults.
 */

const BASE_MODES = {
  light: {
    mode: 'light',
    bg: '#fbf9f8',
    surface2: '#171d1c',
    border: 'rgba(23, 25, 27, 0.09)',
    fg: '#17191b',
    muted: '#6b7270',
    navBg: 'rgba(251, 249, 248, 0.88)',
    gradientFrom: '#17191b',
    gradientTo: '#6b7270'
  },
  dark: {
    mode: 'dark',
    bg: '#0b0c0e',
    surface2: '#070809',
    border: 'rgba(255, 255, 255, 0.09)',
    fg: '#f4f6f8',
    muted: '#8e959e',
    navBg: 'rgba(11, 12, 14, 0.85)',
    gradientFrom: '#f4f6f8',
    gradientTo: '#8e959e'
  }
};

export function resolveTheme(themeConfig = {}) {
  const mode = themeConfig.mode === 'dark' ? 'dark' : 'light';
  return {
    ...BASE_MODES[mode],
    ...themeConfig
  };
}

export function generateStylesheet(themeConfig = {}) {
  const t = resolveTheme(themeConfig);

  return [
    renderRootTokens(t),
    renderBaseTypography(),
    renderNavigation(),
    renderHeroAndCta(),
    renderDirectiveLayouts(),
    renderCodeAndTables(),
    renderFooterAndPopover(),
    renderResponsive()
  ].join('\n\n');
}

function renderRootTokens(t) {
  return `:root {
  --bg: ${t.bg};
  --surface-2: ${t.surface2};
  --border: ${t.border};
  --fg: ${t.fg};
  --muted: ${t.muted};
  --nav-bg: ${t.navBg};
  --gradient-from: ${t.gradientFrom};
  --gradient-to: ${t.gradientTo};
  --font-sans: "Roboto", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --radius: 8px;
}`;
}

function renderBaseTypography() {
  return `/* Base & Editorial Typography */
* {
  box-sizing: border-box;
}

::selection {
  background: color-mix(in srgb, var(--gradient-from) 22%, transparent);
  color: var(--fg);
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  line-height: 1.65;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
  transition: color 0.15s ease, text-decoration-color 0.15s ease, opacity 0.15s ease;
}

main a:not(.btn) {
  text-decoration: underline;
  text-decoration-color: var(--border);
  text-underline-offset: 3px;
}

main a:not(.btn):hover {
  color: var(--fg);
  text-decoration-color: var(--gradient-from);
}

h1, h2, h3 {
  font-weight: 300;
  line-height: 1.25;
  letter-spacing: -0.015em;
}

h1 {
  font-weight: 100;
}

code, pre {
  font-family: var(--font-mono);
}`;
}

function renderNavigation() {
  return `/* Minimal Sticky Blur Nav */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.nav-inner {
  max-width: 880px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.wordmark {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.02em;
  background: linear-gradient(90deg, var(--gradient-from), var(--gradient-to));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-decoration: none;
}

.nav nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav nav a {
  text-decoration: none;
  color: var(--muted);
  font-size: 0.88rem;
  font-weight: 400;
}

.nav nav a:hover,
.nav nav a.active {
  color: var(--fg);
}

.nav-btn {
  color: var(--fg) !important;
  font-weight: 500 !important;
}`;
}

function renderHeroAndCta() {
  return `/* Main Container & Hero */
main {
  max-width: 880px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px 80px;
  flex: 1;
  counter-reset: section-idx;
}

.hero {
  position: relative;
  text-align: center;
  padding: 72px 0 56px;
}

.hero::before {
  content: "";
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: min(560px, 90vw);
  height: 170px;
  background: radial-gradient(
    ellipse at center,
    color-mix(in srgb, var(--gradient-from) 8%, transparent) 0%,
    color-mix(in srgb, var(--gradient-to) 4%, transparent) 45%,
    transparent 75%
  );
  pointer-events: none;
  z-index: 0;
}

.hero > * {
  position: relative;
  z-index: 1;
}

.ascii-logo {
  display: inline-block;
  margin: 0 auto 28px;
  padding: 0;
  font-size: clamp(0.45rem, 1.3vw, 0.82rem);
  line-height: 1.15;
  background: linear-gradient(90deg, var(--gradient-from), var(--gradient-to));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  user-select: none;
  text-align: left;
  border: none;
}

.hero h1 {
  font-size: clamp(2rem, 4.2vw, 2.85rem);
  margin: 0 0 18px;
  font-weight: 100;
}

.hero p {
  max-width: 600px;
  margin: 0 auto 14px;
  color: var(--muted);
  font-size: 1.02rem;
}

.cta-row {
  margin-top: 32px;
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.install {
  display: inline-flex;
  align-items: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 0.88rem;
  color: var(--fg);
  cursor: pointer;
  user-select: all;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.install::before {
  content: "$";
  color: var(--gradient-from);
  margin-right: 9px;
  font-weight: 600;
  user-select: none;
  opacity: 0.85;
}

.install::after {
  content: "";
  display: inline-block;
  width: 6px;
  height: 1.05em;
  background: var(--gradient-from);
  margin-left: 7px;
  vertical-align: -2px;
  animation: stackr-cursor-blink 1.15s steps(2, jump-none) infinite;
  opacity: 0.75;
}

.install.copied::before,
.install.copied::after {
  display: none;
}

@keyframes stackr-cursor-blink {
  0%, 100% { opacity: 0.75; }
  50% { opacity: 0; }
}

.install:hover {
  border-color: var(--muted);
}

.install.copied {
  border-color: var(--gradient-from);
  color: var(--gradient-from);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 6px;
  border: 1px solid var(--border);
  text-decoration: none !important;
  color: var(--fg);
  font-size: 0.9rem;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.15s ease, opacity 0.15s ease;
}

.btn:hover {
  border-color: var(--fg);
}

.btn-primary {
  background: var(--fg);
  color: var(--bg) !important;
  border-color: var(--fg);
  font-weight: 500;
}

.btn-primary:hover {
  opacity: 0.86;
}

/* Sections */
section {
  padding: 56px 0;
  border-top: 1px solid var(--border);
}

section:not(.hero) {
  counter-increment: section-idx;
}

section:not(.hero) > h2::before {
  content: "// " counter(section-idx, decimal-leading-zero);
  display: block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--gradient-from);
  opacity: 0.85;
  margin-bottom: 6px;
}

section h2 {
  font-size: 1.4rem;
  font-weight: 300;
  margin: 0 0 10px;
}

section > p {
  color: var(--muted);
  margin-top: 0;
}`;
}

function renderDirectiveLayouts() {
  return `/* Borderless 3-Column Feature Grid (.features / :::features) */
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 36px;
  row-gap: 32px;
  margin: 32px 0 8px;
}

.feature {
  padding: 0;
  background: none;
  border: none;
}

.feature h3 {
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--fg);
}

.feature p {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Borderless 2-Column Numbered Flow Steps (.flow-grid / :::flow) */
.flow-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 44px;
  row-gap: 36px;
  margin: 32px 0 8px;
}

.flow-step {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0;
  background: none;
  border: none;
}

.step-num {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--gradient-from);
  letter-spacing: 0.04em;
}

.step-content h3 {
  font-size: 1.02rem;
  font-weight: 500;
  margin: 0 0 6px;
  color: var(--fg);
}

.step-content p,
.step-content ul {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.step-content ul {
  padding-left: 16px;
}

.step-content li {
  margin-bottom: 6px;
}

.step-content strong {
  color: var(--fg);
  font-weight: 500;
}

/* Minimal CLI Command List (.cli-grid / :::cli) */
.cli-grid {
  list-style: none;
  padding: 0;
  margin: 28px 0 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 36px;
  row-gap: 20px;
}

.cli-grid li {
  padding: 0;
  background: none;
  border: none;
  font-size: 0.88rem;
  color: var(--muted);
  line-height: 1.55;
}

.cli-grid li code:first-child {
  color: var(--fg);
  font-weight: 600;
  background: none;
  padding: 0;
  display: block;
  margin-bottom: 2px;
  font-size: 0.86rem;
}

/* Minimal Agent Copy-Prompt Box (:::prompt) */
.agent-prompt-box {
  margin: 32px auto 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
  text-align: left;
  max-width: 640px;
}

.agent-prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 12px;
}

.agent-prompt-title {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}

.copy-text-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.76rem;
  cursor: pointer;
  padding: 2px 6px;
}

.copy-text-btn:hover {
  color: var(--fg);
}

.agent-prompt-box pre {
  margin: 0;
  background: transparent;
  color: var(--fg);
  padding: 0;
  border: none;
  font-size: 0.82rem;
  white-space: pre-wrap;
  line-height: 1.5;
}`;
}

function renderCodeAndTables() {
  return `/* Minimal Borderless Tables (Comparison Matrix) */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  text-align: left;
  margin: 28px 0 8px;
}

th, td {
  padding: 12px 16px 12px 0;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

th {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  color: var(--muted);
}

td strong {
  color: var(--fg);
  font-weight: 500;
}

tr:last-child td {
  border-bottom: none;
}

/* Code Blocks & Inline Code */
pre:not(.ascii-logo):not(.agent-prompt-content) {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
  overflow-x: auto;
  font-size: 0.84rem;
  color: #d1dbd5;
  line-height: 1.55;
}

code {
  background: color-mix(in srgb, var(--fg) 6%, transparent);
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.86em;
}

pre code {
  background: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

/* Callout / Note Box */
blockquote {
  margin: 20px 0;
  padding: 4px 0 4px 16px;
  border-left: 2px solid var(--border);
  color: var(--muted);
}

blockquote p {
  margin: 0;
}

/* Demo / Media container */
.demo-box {
  margin: 40px 0 0;
  text-align: center;
}

.demo-frame {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
  background: var(--surface-2);
}

.caption {
  color: var(--muted);
  font-size: 0.86rem;
  max-width: 580px;
  margin: 14px auto 0;
  text-align: center;
}`;
}

function renderFooterAndPopover() {
  return `/* Footer & *stac.kr Suite Popover */
footer {
  border-top: 1px solid var(--border);
  text-align: center;
  padding: 36px 24px;
  color: var(--muted);
  font-size: 0.82rem;
  margin-top: auto;
}

footer a {
  text-decoration: none;
}

footer a:hover {
  color: var(--fg);
}

.footer-apps-btn {
  anchor-name: --stackr-apps-trigger;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  padding: 0;
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 0.82rem;
  cursor: pointer;
}

.footer-apps-btn:hover {
  color: var(--fg);
}

.stackr-apps-popover {
  position: fixed;
  inset: auto;
  bottom: 64px;
  left: 50%;
  translate: -50% 0;
  margin: 0;
  width: min(300px, calc(100vw - 32px));
  background: var(--bg);
  color: var(--fg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
  text-align: left;
}

@supports (position-area: block-start) {
  .stackr-apps-popover {
    position-anchor: --stackr-apps-trigger;
    position-area: block-start;
    position-try-fallbacks: flip-block, flip-inline;
    bottom: auto;
    left: auto;
    translate: none;
    margin-bottom: 10px;
  }
}

.stackr-apps-popover:popover-open {
  display: block;
}

.stackr-apps-header {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  padding: 4px 10px 8px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
}

.stackr-apps-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

footer .stackr-app-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  text-decoration: none;
}

footer .stackr-app-item:hover {
  background: color-mix(in srgb, var(--fg) 5%, transparent);
}

.stackr-app-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  margin-top: 6px;
  flex-shrink: 0;
}

.stackr-app-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.stackr-app-name {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--fg);
  line-height: 1.3;
}

.stackr-app-desc {
  font-size: 0.75rem;
  color: var(--muted);
  line-height: 1.35;
}`;
}

function renderResponsive() {
  return `@media (max-width: 760px) {
  .features,
  .flow-grid,
  .cli-grid {
    grid-template-columns: 1fr;
    row-gap: 24px;
  }
  .hero h1 {
    font-size: 1.75rem;
  }
  .ascii-logo {
    font-size: 0.5rem;
  }
}`;
}
