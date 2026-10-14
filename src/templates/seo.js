import { escapeHtml } from '../utils/html.js';

/**
 * Generates a standard XML sitemap (`sitemap.xml`) from compiled pages and `siteConfig.url`,
 * including `/llms.txt` so search engines and AI crawlers index the documentation.
 */
export function generateSitemapXml(siteConfig, pages) {
  const baseUrl = (siteConfig.url || `https://${siteConfig.name || 'stackr'}.kr`).replace(/\/$/, '');
  const today = new Date().toISOString().split('T')[0];

  const urls = pages.map((page) => {
    const loc = page.slug === 'index' ? `${baseUrl}/` : `${baseUrl}/${page.slug}.html`;
    const priority = page.slug === 'index' ? '1.0' : '0.8';
    return `  <url>
    <loc>${escapeHtml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`;
  });

  // Also include /llms.txt in the sitemap for AI/search crawlers
  urls.push(`  <url>
    <loc>${escapeHtml(`${baseUrl}/llms.txt`)}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.7</priority>
  </url>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

/**
 * Generates a clean `robots.txt` allowing all crawlers and pointing to both
 * `sitemap.xml` and `llms.txt` for AI/agent discovery.
 */
export function generateRobotsTxt(siteConfig) {
  const baseUrl = (siteConfig.url || `https://${siteConfig.name || 'stackr'}.kr`).replace(/\/$/, '');
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
LLMs-Txt: ${baseUrl}/llms.txt
`;
}
