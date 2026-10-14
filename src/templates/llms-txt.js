/**
 * Strips custom directives (`:::features`, `:::flow`, `{{include:...}}`) into clean,
 * LLM-friendly Markdown for `/llms.txt`.
 */
export function generateLlmsTxt(siteConfig, pages) {
  const name = siteConfig.name || 'stackr';
  const lines = [
    `# ${name}`,
    '',
    `> ${siteConfig.description || siteConfig.tagline || ''}`,
    ''
  ];

  if (siteConfig.url) lines.push(`- Website: ${siteConfig.url}`);
  if (siteConfig.github) lines.push(`- GitHub: ${siteConfig.github}`);
  if (siteConfig.mcpUrl) lines.push(`- MCP Endpoint: ${siteConfig.mcpUrl}`);
  lines.push('');

  for (const page of pages) {
    const cleaned = page.rawBody
      .replace(/^:::[a-zA-Z0-9_-]+(?:[ \t]+[^\r\n]*)?\r?\n/gm, '')
      .replace(/^:::[ \t]*$/gm, '')
      .replace(/\{\{\s*include:[^\s}]+\s*\}\}/g, '')
      .replace(/\{#[a-zA-Z0-9_-]+\}/g, '')
      .replace(/\{\.[a-zA-Z0-9_.\s-]+\}/g, '')
      .trim();

    if (page.slug !== 'index') {
      lines.push(`---`, ``, `# Page: ${page.meta.title || page.slug}`, ``);
    }
    lines.push(cleaned, '');
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
}
