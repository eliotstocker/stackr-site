import fs from 'node:fs';
import path from 'node:path';
import { renderAsciiLogo } from './ascii.js';
import { generateStylesheet } from './themes/stylesheet.js';
import { parseFrontmatter } from './markdown/frontmatter.js';
import { renderPageSections } from './markdown/blocks.js';
import { DEFAULT_STACKR_APPS, renderHtmlDocument } from './templates/document.js';
import { generateLlmsTxt } from './templates/llms-txt.js';
import { generateSitemapXml, generateRobotsTxt } from './templates/seo.js';

export { DEFAULT_STACKR_APPS, renderHtmlDocument, generateLlmsTxt, generateSitemapXml, generateRobotsTxt };

/**
 * Compiles a project directory containing `site.json` + `*.md` + optional `snippets/` & `assets/`
 * into a self-contained static output folder.
 *
 * Extensibility options (`options` third argument):
 * - `beforeBuild({ srcDir, outDir, siteConfig })`
 * - `transformPage({ slug, meta, html, rawBody, siteConfig }) => string | void`
 * - `afterBuild({ srcDir, outDir, siteConfig, pages })`
 */
export function buildSite(srcDir, outDir, options = {}) {
  const absSrc = path.resolve(srcDir);
  const absOut = path.resolve(outDir || path.join(absSrc, 'dist'));

  const configPath = path.join(absSrc, 'site.json');
  const siteConfig = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : { name: path.basename(absSrc) };

  if (typeof options.beforeBuild === 'function') {
    options.beforeBuild({ srcDir: absSrc, outDir: absOut, siteConfig });
  }

  // 1. Generate unified CSS from site-supplied theme tokens + optional custom.css
  const cssOutRel = siteConfig.cssOut || 'assets/style.css';
  const cssOutFull = path.join(absOut, cssOutRel);
  fs.mkdirSync(path.dirname(cssOutFull), { recursive: true });

  let css = generateStylesheet(siteConfig.theme || {});
  const customCssPath = path.join(absSrc, 'custom.css');
  if (fs.existsSync(customCssPath)) {
    css += '\n/* Custom Site Overrides */\n' + fs.readFileSync(customCssPath, 'utf8');
  }
  fs.writeFileSync(cssOutFull, css, 'utf8');

  // 2. Copy static assets if present and src !== out
  const srcAssets = path.join(absSrc, 'assets');
  const destAssets = path.join(absOut, 'assets');
  if (fs.existsSync(srcAssets) && path.resolve(srcAssets) !== path.resolve(destAssets)) {
    copyDirRecursive(srcAssets, destAssets);
  }

  // 3. Discover and compile all top-level .md files (and optional pages/*.md)
  const mdFiles = discoverMarkdownFiles(absSrc);
  const compiledPages = [];

  for (const relFile of mdFiles) {
    const fullPath = path.join(absSrc, relFile);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data: meta, body } = parseFrontmatter(raw);
    const slug = path.basename(relFile, '.md');
    const isIndex = slug === 'index';

    // Render 3-line ASCII block logo on index hero (or when `logo: true` in frontmatter)
    const showLogo = meta.logo !== 'false' && (isIndex || meta.logo === 'true');
    const logoText = meta.logoText || siteConfig.logoText || siteConfig.name || 'stackr';
    const asciiLogo = siteConfig.asciiLogo || renderAsciiLogo(logoText);
    const asciiLogoHtml = showLogo
      ? `<pre class="ascii-logo" aria-hidden="true">${asciiLogo}</pre>\n`
      : '';

    const sectionsHtml = renderPageSections(body, {
      asciiLogoHtml,
      baseDir: path.dirname(fullPath),
      autoHero: meta.hero !== 'false'
    });

    let html = renderHtmlDocument({
      siteConfig,
      pageMeta: meta,
      sectionsHtml
    });

    if (typeof options.transformPage === 'function') {
      const transformed = options.transformPage({ slug, meta, html, rawBody: body, siteConfig });
      if (typeof transformed === 'string') html = transformed;
    }

    const outHtmlPath = path.join(absOut, `${slug}.html`);
    fs.writeFileSync(outHtmlPath, html, 'utf8');

    compiledPages.push({ slug, meta, rawBody: body, outHtmlPath });
  }

  // Sort compiled pages so index is always first
  compiledPages.sort((a, b) => (a.slug === 'index' ? -1 : b.slug === 'index' ? 1 : a.slug.localeCompare(b.slug)));

  // 4. Generate /llms.txt automatically unless disabled
  if (compiledPages.length > 0 && siteConfig.generateLlmsTxt !== false) {
    const llmsTxt = generateLlmsTxt(siteConfig, compiledPages);
    fs.writeFileSync(path.join(absOut, 'llms.txt'), llmsTxt, 'utf8');
  }

  // 5. Generate /sitemap.xml and /robots.txt unless disabled
  if (compiledPages.length > 0 && siteConfig.generateSitemap !== false) {
    fs.writeFileSync(path.join(absOut, 'sitemap.xml'), generateSitemapXml(siteConfig, compiledPages), 'utf8');
  }
  if (siteConfig.generateRobotsTxt !== false) {
    fs.writeFileSync(path.join(absOut, 'robots.txt'), generateRobotsTxt(siteConfig), 'utf8');
  }

  if (typeof options.afterBuild === 'function') {
    options.afterBuild({ srcDir: absSrc, outDir: absOut, siteConfig, pages: compiledPages });
  }

  return {
    outDir: absOut,
    pages: compiledPages.map((p) => `${p.slug}.html`),
    theme: siteConfig.theme
  };
}

function discoverMarkdownFiles(absSrc) {
  const mdFiles = fs
    .readdirSync(absSrc)
    .filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md');

  const pagesDir = path.join(absSrc, 'pages');
  if (fs.existsSync(pagesDir)) {
    for (const f of fs.readdirSync(pagesDir)) {
      if (f.endsWith('.md')) mdFiles.push(path.join('pages', f));
    }
  }
  return mdFiles;
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
