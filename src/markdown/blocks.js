import fs from 'node:fs';
import path from 'node:path';
import { escapeHtml, slugify } from '../utils/html.js';
import { parseInline } from './inline.js';
import { renderDirective } from './directives.js';

/**
 * Renders block-level Markdown (fenced code, HTML includes, `:::directives`, headings,
 * blockquotes, tables, lists, and paragraphs) into HTML.
 */
export function renderMarkdownBlocks(markdown, baseDir = process.cwd()) {
  const htmlBlocks = [];

  // 1. Protect `{{include:...}}` HTML snippets as atomic block placeholders
  const withProtectedIncludes = markdown.replace(/\{\{\s*include:([^\s}]+)\s*\}\}/g, (_, relPath) => {
    const full = path.resolve(baseDir, relPath.trim());
    if (!fs.existsSync(full)) {
      return `<!-- stackr-site: missing include ${relPath} -->`;
    }
    const content = fs.readFileSync(full, 'utf8').trim();
    const idx = htmlBlocks.length;
    htmlBlocks.push(content);
    return `\n\x00BLOCKCODE${idx}\x00\n`;
  });

  // 2. Protect fenced code blocks
  const withoutCode = withProtectedIncludes.replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = htmlBlocks.length;
    const cls = lang ? ` class="language-${lang}"` : '';
    htmlBlocks.push(`<pre><code${cls}>${escapeHtml(code.replace(/\r?\n$/, ''))}</code></pre>`);
    return `\n\x00BLOCKCODE${idx}\x00\n`;
  });

  // 3. Process `:::directive ... :::` blocks through the directive registry
  const withDirectives = withoutCode.replace(
    /^:::([a-zA-Z0-9_-]+)(?:[ \t]+([^\r\n]*))?\r?\n([\s\S]*?)^:::[ \t]*$/gm,
    (_, type, arg, inner) => {
      const rendered = renderDirective(
        type.trim(),
        (arg || '').trim(),
        inner.trim(),
        htmlBlocks,
        baseDir,
        renderMarkdownBlocks
      );
      const idx = htmlBlocks.length;
      htmlBlocks.push(rendered);
      return `\n\x00BLOCKCODE${idx}\x00\n`;
    }
  );

  const lines = withDirectives.split(/\r?\n/);
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // Block placeholder (fenced code, directive, or HTML include)
    const codeMatch = line.trim().match(/^\x00BLOCKCODE(\d+)\x00$/);
    if (codeMatch) {
      html.push(htmlBlocks[Number(codeMatch[1])]);
      i++;
      continue;
    }

    // Raw HTML block pass-through
    if (/^\s*<\/?(div|section|header|footer|pre|table|figure|video|script|style|iframe|hr|ul|ol|p|h[1-6]|!--)/i.test(line)) {
      html.push(line);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^\s*---\s*$/.test(line)) {
      html.push('<hr />');
      i++;
      continue;
    }

    // Headings (# to ####)
    const hMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      const text = hMatch[2].trim();
      html.push(`<h${level}>${parseInline(text)}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      const qLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        qLines.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      html.push(`<blockquote><p>${parseInline(qLines.join(' '))}</p></blockquote>`);
      continue;
    }

    // Markdown Table
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) {
      const headers = splitTableRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().includes('|')) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      const thead = `<thead><tr>${headers.map((h) => `<th>${parseInline(h)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${parseInline(c)}</td>`).join('')}</tr>`)
        .join('')}</tbody>`;
      html.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // Unordered List
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(`<li>${parseInline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`);
        i++;
      }
      html.push(`<ul>\n${items.join('\n')}\n</ul>`);
      continue;
    }

    // Ordered List
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${parseInline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i++;
      }
      html.push(`<ol class="step-list">\n${items.join('\n')}\n</ol>`);
      continue;
    }

    // Paragraph
    const pLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|[-*]\s|\d+\.\s|>\s|---|\x00BLOCKCODE|\s*<\/?(?:div|section|pre|table|script|hr|ul|ol|p|h[1-6]))/i.test(lines[i])
    ) {
      pLines.push(lines[i].trim());
      i++;
    }
    if (pLines.length) {
      html.push(`<p>${parseInline(pLines.join(' '))}</p>`);
    } else {
      html.push(lines[i]);
      i++;
    }
  }

  return html
    .join('\n')
    .replace(/\x00BLOCKCODE(\d+)\x00/g, (_, idx) => htmlBlocks[Number(idx)]);
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

/**
 * Splits a full Markdown document into top-level `<section>` blocks
 * separated by `## Section Heading` (with optional `{#custom-id}` anchor).
 */
export function renderPageSections(markdown, { asciiLogoHtml = '', baseDir = process.cwd(), autoHero = true } = {}) {
  const chunks = [];
  const lines = markdown.split(/\r?\n/);
  let current = { id: null, heading: null, lines: [] };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.*?)(?:\s*\{#([a-zA-Z0-9_-]+)\})?\s*$/);
    if (h2) {
      if (current.heading || current.lines.some((l) => l.trim())) {
        chunks.push(current);
      }
      const rawTitle = h2[1].trim();
      const customId = h2[2] || slugify(rawTitle);
      current = { id: customId, heading: rawTitle, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.heading || current.lines.some((l) => l.trim())) {
    chunks.push(current);
  }

  return chunks
    .map((chunk, index) => {
      const bodyHtml = renderMarkdownBlocks(chunk.lines.join('\n'), baseDir);
      if (index === 0 && !chunk.heading && autoHero) {
        return `<section class="hero">\n${asciiLogoHtml}${bodyHtml}\n</section>`;
      }
      const idAttr = chunk.id ? ` id="${chunk.id}"` : '';
      const headingHtml = chunk.heading ? `<h2>${parseInline(chunk.heading)}</h2>\n` : '';
      return `<section${idAttr}>\n${headingHtml}${bodyHtml}\n</section>`;
    })
    .join('\n\n');
}
