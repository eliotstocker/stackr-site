import { escapeAttr } from '../utils/html.js';
import { parseInline } from '../markdown/inline.js';
import { renderClientRuntime } from './client-runtime.js';

export const DEFAULT_STACKR_APPS = [
  {
    name: 'vibestac.kr',
    url: 'https://vibestac.kr',
    tagline: 'One-command local dev stack & MCP server',
    gradient: 'linear-gradient(90deg, #ff6ec7, #ffa500)'
  },
  {
    name: 'metastac.kr',
    url: 'https://metastac.kr',
    tagline: 'Stacked PRs & multi-repo git orchestration',
    gradient: 'linear-gradient(90deg, #00FF88, #FACC15)'
  },
  {
    name: 'vibebac.kr',
    url: 'https://vibebac.kr',
    tagline: 'Instant zero-config backend for AI agents',
    gradient: 'linear-gradient(90deg, #6366f1, #06b6d4)'
  },
  {
    name: 'deploystac.kr',
    url: 'https://deploystac.kr',
    tagline: 'Lightweight GitOps promotion dashboard',
    gradient: 'linear-gradient(90deg, #a855f7, #f43f5e)'
  }
];

/**
 * Renders a complete *stac.kr HTML document from compiled sections + site configuration.
 */
export function renderHtmlDocument({
  siteConfig,
  pageMeta,
  sectionsHtml
}) {
  const name = siteConfig.name || 'stackr';
  const title = pageMeta.title
    ? `${pageMeta.title} — ${name}`
    : `${name} — ${siteConfig.tagline || 'built for developers and AI agents'}`;
  const description = pageMeta.description || siteConfig.description || siteConfig.tagline || '';
  const url = siteConfig.url || `https://${name}.kr`;
  const faviconEmoji = siteConfig.favicon || '⚡';
  const headExtra = siteConfig.headExtra || '';
  const bodyEndExtra = siteConfig.bodyEndExtra || '';
  const cssHref = siteConfig.cssHref || 'assets/style.css';

  const jsonLd = buildJsonLd(siteConfig, name, description, url);
  const navLinks = renderNavLinks(siteConfig.nav || []);
  const footerHtml = renderFooter(siteConfig);
  const runtimeScripts = renderClientRuntime(siteConfig.glitch);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeAttr(title)}</title>
  <meta name="description" content="${escapeAttr(description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700&display=swap" />
  <link rel="stylesheet" href="${escapeAttr(cssHref)}" />
  ${headExtra}
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${faviconEmoji}</text></svg>" />
  <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
  <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM summary" />
  <link rel="help" type="text/plain" href="/llms.txt" title="Agent Overview (llms.txt)" />
  <meta name="llms" content="/llms.txt" />
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>

<header class="nav">
  <div class="nav-inner">
    <a href="index.html" class="wordmark">${escapeAttr(name)}</a>
    <nav>
      ${navLinks}
    </nav>
  </div>
</header>

<main>
${sectionsHtml}
</main>

<footer>
  ${footerHtml}
</footer>
${bodyEndExtra}
${runtimeScripts}
</body>
</html>
`;
}

function buildJsonLd(siteConfig, name, description, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.title || name,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    description,
    url,
    ...(siteConfig.mcpUrl ? { installUrl: siteConfig.mcpUrl } : {}),
    ...(siteConfig.features ? { featureList: siteConfig.features } : {}),
    documentation: `${url.replace(/\/$/, '')}/llms.txt`
  };
}

function renderNavLinks(navItems) {
  return navItems
    .map((item) => {
      const cls = item.primary ? ' class="nav-btn"' : '';
      const ext = item.external ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${item.href}"${cls}${ext}>${item.label}</a>`;
    })
    .join('\n      ');
}

function renderFooter(siteConfig) {
  const suiteApps = siteConfig.apps === false
    ? []
    : (Array.isArray(siteConfig.apps) ? siteConfig.apps : DEFAULT_STACKR_APPS);

  const appsTriggerHtml = suiteApps.length
    ? ` · <button type="button" class="footer-apps-btn" popovertarget="stackr-apps-popover">Other Apps ▴</button>`
    : '';

  const appsPopoverHtml = suiteApps.length
    ? `\n  <div id="stackr-apps-popover" popover="auto" class="stackr-apps-popover">
    <div class="stackr-apps-header">*stac.kr suite</div>
    <div class="stackr-apps-list">
${suiteApps
  .map(
    (app) => `      <a href="${escapeAttr(app.url)}" class="stackr-app-item" target="_blank" rel="noopener">
        <span class="stackr-app-dot" style="background: ${escapeAttr(app.gradient || 'linear-gradient(90deg, var(--gradient-from), var(--gradient-to))')}"></span>
        <span class="stackr-app-info">
          <span class="stackr-app-name">${escapeAttr(app.name)}</span>
          <span class="stackr-app-desc">${escapeAttr(app.tagline || '')}</span>
        </span>
      </a>`
  )
  .join('\n')}
    </div>
  </div>`
    : '';

  return siteConfig.footer
    ? `<p>${parseInline(siteConfig.footer)}${appsTriggerHtml}</p>${appsPopoverHtml}`
    : `<p>MIT licensed · <a href="llms.txt">llms.txt</a>${
        siteConfig.github ? ` · <a href="${siteConfig.github}">${siteConfig.github.replace(/^https?:\/\//, '')}</a>` : ''
      }${appsTriggerHtml}</p>${appsPopoverHtml}`;
}
