import { escapeHtml } from '../utils/html.js';

/**
 * Parses inline Markdown syntax (code spans, images, links with `{.class}` attributes,
 * bold, italic, and arrows).
 */
export function parseInline(text) {
  if (!text) return '';
  const codeSpans = [];
  let out = text.replace(/`([^`]+)`/g, (_, code) => {
    const idx = codeSpans.length;
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return `\x00CODE${idx}\x00`;
  });

  // Images
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links: support [Label](url){.btn .btn-primary} attribute shorthand
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)(?:\{([^}]+)\})?/g, (_, label, url, attrs) => {
    let classAttr = '';
    if (attrs) {
      const classes = attrs
        .split(/\s+/)
        .filter((t) => t.startsWith('.'))
        .map((t) => t.slice(1))
        .join(' ');
      if (classes) classAttr = ` class="${classes}"`;
    }
    return `<a href="${url}"${classAttr}>${parseInline(label)}</a>`;
  });

  // Bold & Italic
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/-->/g, '&rarr;').replace(/->/g, '&rarr;');

  // Restore inline code
  out = out.replace(/\x00CODE(\d+)\x00/g, (_, idx) => codeSpans[Number(idx)]);
  return out;
}
