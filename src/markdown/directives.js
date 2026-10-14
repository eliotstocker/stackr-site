import { escapeHtml } from '../utils/html.js';
import { parseInline } from './inline.js';

/**
 * Pluggable directive registry (`:::directive [arg] ... :::`).
 * Each handler receives `{ type, arg, inner, restoredInner, baseDir, renderBlocks, splitByH3 }`
 * and returns an HTML string.
 */
const DIRECTIVE_HANDLERS = new Map();

/**
 * Registers a custom `:::name` directive handler (or overrides a built-in one).
 */
export function registerDirective(name, handler) {
  DIRECTIVE_HANDLERS.set(String(name).toLowerCase(), handler);
}

/**
 * Splits a directive body on `### Subheading` into `{ title, body }` blocks.
 */
export function splitByH3(text) {
  const parts = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^###\s+(.*)$/);
    if (m) {
      if (current) parts.push({ title: current.title, body: current.lines.join('\n').trim() });
      current = { title: m[1].trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) {
    parts.push({ title: current.title, body: current.lines.join('\n').trim() });
  }
  return parts;
}

// Built-in: :::features (3-column typographic grid)
registerDirective('features', ({ inner, baseDir, renderBlocks }) => {
  const cards = splitByH3(inner);
  const cardsHtml = cards
    .map((c) => `<div class="feature">\n<h3>${parseInline(c.title)}</h3>\n${renderBlocks(c.body, baseDir)}\n</div>`)
    .join('\n');
  return `<div class="features">\n${cardsHtml}\n</div>`;
});

// Built-in: :::flow (2-column numbered 01/02/03 steps)
registerDirective('flow', ({ inner, baseDir, renderBlocks }) => {
  const steps = splitByH3(inner);
  const stepsHtml = steps
    .map((s, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      return `<div class="flow-step">
  <div class="step-num">${num}</div>
  <div class="step-content">
    <h3>${parseInline(s.title)}</h3>
    ${renderBlocks(s.body, baseDir)}
  </div>
</div>`;
    })
    .join('\n');
  return `<div class="flow-grid">\n${stepsHtml}\n</div>`;
});

// Built-in: :::cli (2-column CLI command list)
registerDirective('cli', ({ inner, baseDir, renderBlocks }) => {
  return renderBlocks(inner, baseDir).replace(/<ul>/, '<ul class="cli-grid">');
});

// Built-in: :::cta (hero CTA row with click-to-copy install pills & buttons)
registerDirective('cta', ({ inner }) => {
  const items = inner
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const codeMatch = line.match(/^[-*]?\s*`([^`]+)`$/);
      if (codeMatch) {
        const cmd = escapeHtml(codeMatch[1]);
        return `<code class="install" role="button" tabindex="0" onclick="copyInstallPill(this, '${cmd.replace(/'/g, "\\'")}')" title="Click to copy">${cmd}</code>`;
      }
      const linkMatch = line.match(/^[-*]?\s*\[([^\]]+)\]\(([^)]+)\)(?:\{([^}]+)\})?$/);
      if (linkMatch) {
        const isPrimary = (linkMatch[3] || '').includes('primary');
        const cls = isPrimary ? 'btn btn-primary' : 'btn';
        return `<a class="${cls}" href="${linkMatch[2]}">${parseInline(linkMatch[1])}</a>`;
      }
      return parseInline(line);
    });
  return `<div class="cta-row">\n${items.join('\n')}\n</div>`;
});

// Built-in: :::prompt (copyable AI agent prompt box)
registerDirective('prompt', ({ arg, restoredInner }) => {
  const cleanArg = (arg || '').replace(/^[^\w\s]+\s*/, '').trim();
  const title = cleanArg || 'Prompt for Claude, Cursor, Copilot & Gemini';
  const rawPrompt = restoredInner.replace(/^```[a-zA-Z0-9_-]*\r?\n|\r?\n```$/g, '').trim();
  return `<div class="agent-prompt-box">
  <div class="agent-prompt-header">
    <span class="agent-prompt-title">${escapeHtml(title)}</span>
    <button type="button" class="copy-text-btn" onclick="copyPromptBox(this)">Copy</button>
  </div>
  <pre class="agent-prompt-content">${escapeHtml(rawPrompt)}</pre>
</div>`;
});

/**
 * Dispatches a `:::directive` block to its registered handler, or falls back to `<div class="{type}">`.
 */
export function renderDirective(type, arg, inner, codeBlocks, baseDir, renderBlocks) {
  const restoredInner = inner.replace(/\x00BLOCKCODE(\d+)\x00/g, (_, idx) => codeBlocks[Number(idx)]);
  const handler = DIRECTIVE_HANDLERS.get(String(type).toLowerCase());
  if (handler) {
    return handler({
      type,
      arg,
      inner,
      restoredInner,
      baseDir,
      renderBlocks,
      splitByH3,
      parseInline,
      escapeHtml
    });
  }
  return `<div class="${escapeHtml(type)}">\n${renderBlocks(inner, baseDir)}\n</div>`;
}
