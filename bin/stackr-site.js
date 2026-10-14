#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { buildSite } from '../src/builder.js';
import { renderAsciiLogo } from '../src/ascii.js';

const args = process.argv.slice(2);
const cmd = args[0] || 'help';

function parseFlags(argv) {
  const flags = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-o' || a === '--out') {
      flags.out = argv[++i];
    } else if (a === '-p' || a === '--port') {
      flags.port = Number(argv[++i]);
    } else if (a === '-m' || a === '--mode') {
      flags.mode = argv[++i];
    } else if (a === '--name') {
      flags.name = argv[++i];
    } else if (!a.startsWith('-')) {
      flags._.push(a);
    }
  }
  return flags;
}

if (cmd === 'ascii') {
  const text = args.slice(1).join(' ') || 'vibestackr';
  console.log(renderAsciiLogo(text));
  process.exit(0);
}

if (cmd === 'init') {
  const flags = parseFlags(args.slice(1));
  const targetDir = path.resolve(flags._[0] || '.');
  const siteName = flags.name || path.basename(targetDir);
  const mode = flags.mode === 'dark' ? 'dark' : 'light';

  fs.mkdirSync(path.join(targetDir, 'snippets'), { recursive: true });

  const siteJson = {
    name: siteName,
    tagline: 'One command workflow for you and your AI coding agent',
    description: `${siteName} — minimal developer tool built for humans and AI coding agents.`,
    url: `https://${siteName}.kr`,
    github: `https://github.com/eliotstocker/${siteName}`,
    favicon: '⚡',
    theme: {
      mode,
      gradientFrom: mode === 'dark' ? '#00FF88' : '#ff6ec7',
      gradientTo: mode === 'dark' ? '#FACC15' : '#ffa500'
    },
    nav: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Features', href: '#features' },
      { label: 'CLI', href: '#cli' },
      { label: 'Agents', href: '#agents' },
      { label: 'GitHub', href: `https://github.com/eliotstocker/${siteName}`, primary: true }
    ]
  };

  const indexMd = `---
description: ${siteName} — built for humans and AI coding agents.
---

# One Command. Built For You and Your Agent.

Coordinate your stack with zero config friction. Driven by a single file in your repo and built as a first-class citizen for both humans and AI coding agents.

:::cta
- \`npx ${siteName}\`
- [View on GitHub](https://github.com/eliotstocker/${siteName}){.btn-primary}
:::

:::prompt 🤖 Prompt for Claude, Cursor, Copilot & Gemini
Use ${siteName} (https://${siteName}.kr/llms.txt) in this workspace.
Run \`npx ${siteName} init\` to bootstrap the configuration and inspect live status via MCP.
:::

{{include:snippets/demo.html}}

## How It Works {#how-it-works}

An end-to-end automated workflow from local setup to production.

:::flow
### Initialize in One Command
- **Zero Boilerplate**: Run \`npx ${siteName} init\` and let your installed CLI agent inspect your repo and generate the config.
- **Instant Validation**: Checks ports, dependencies, and environment variables before startup.

### Live Agent & Human Control
- **MCP Native**: Expose live logs, status, and actions directly to Claude, Cursor, or Antigravity.
- **Hot Reload**: Modify config on the fly without tearing down running services.
:::

## Features {#features}

Everything you need without the bloat.

:::features
### Dependency-Ordered Startup
Declare \`dependsOn\` between services and tools so everything boots in topological order.

### Real Liveness Checks
Port, HTTP, or custom shell command checks flip services to *ready* only when they can actually take traffic.

### Agent-First Surface
Built-in \`mcp\` server and \`llms.txt\` specification so your coding agent sees what you see.
:::

## CLI Commands {#cli}

Operate natively from your terminal or agent tool calls:

:::cli
- \`${siteName} init\`: Inspect the workspace and generate a starter config using your CLI agent.
- \`${siteName} up\`: Start all services in topological dependency order with live TUI tabs.
- \`${siteName} mcp\`: Start the Model Context Protocol server over stdio or HTTP.
- \`${siteName} status --json\`: Output deterministic machine-readable state for AI agents.
:::

## Built for You *and* Your AI Coding Agent {#agents}

Not a human-facing UI with an API bolted on after the fact — the agent-facing surface is a first-class citizen.

- \`${siteName} init\` hands an agent the job of writing your config in the first place.
- \`${siteName} mcp\` lets an agent read status/logs or trigger actions mid-session without leaving its context.
`;

  const demoSnippet = `<div class="demo-box">
  <div class="demo-frame" style="padding: 28px; text-align: left; font-family: var(--font-mono); font-size: 0.85rem; color: #cbe5d6;">
    <div style="color: #6b7270; margin-bottom: 10px;"># Interactive HTML snippet loaded from snippets/demo.html</div>
    <div><span style="color: #00FF88;">$</span> npx ${siteName} init</div>
    <div style="color: #A0B2A6;">✔ Discovered 3 services (postgres, api, web)</div>
    <div style="color: #A0B2A6;">✔ MCP server listening on stdio</div>
  </div>
  <p class="caption">Drop any custom HTML widget, Asciinema player, or synchronized video stage into <code>snippets/*.html</code> and include it with <code>{{include:snippets/demo.html}}</code>.</p>
</div>
`;

  fs.writeFileSync(path.join(targetDir, 'site.json'), JSON.stringify(siteJson, null, 2) + '\n');
  fs.writeFileSync(path.join(targetDir, 'index.md'), indexMd);
  fs.writeFileSync(path.join(targetDir, 'snippets', 'demo.html'), demoSnippet);

  console.log(`✔ Initialized *stac.kr site in ${targetDir}`);
  console.log(`  Run: stackr-site build ${flags._[0] || '.'}`);
  console.log(`  Or:  stackr-site serve ${flags._[0] || '.'}`);
  process.exit(0);
}

if (cmd === 'build') {
  const flags = parseFlags(args.slice(1));
  const srcDir = flags._[0] || '.';
  const res = buildSite(srcDir, flags.out);
  console.log(`✔ Built ${res.pages.length} page(s) + SEO/agent assets → ${res.outDir}`);
  for (const p of res.pages) {
    console.log(`  • ${p}`);
  }
  console.log(`  • llms.txt`);
  console.log(`  • sitemap.xml`);
  console.log(`  • robots.txt`);
  console.log(`  • assets/style.css`);
  process.exit(0);
}

if (cmd === 'serve') {
  const flags = parseFlags(args.slice(1));
  const srcDir = path.resolve(flags._[0] || '.');
  const outDir = path.resolve(flags.out || path.join(srcDir, 'dist'));
  const port = flags.port || 4321;

  const rebuild = () => {
    try {
      buildSite(srcDir, outDir);
      console.log(`[${new Date().toLocaleTimeString()}] Rebuilt site → ${outDir}`);
    } catch (err) {
      console.error('Build error:', err.message);
    }
  };

  rebuild();

  // Watch source directory for changes
  fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (filename.startsWith('dist') || filename.startsWith('.git')) return;
    rebuild();
  });

  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4',
    '.cast': 'application/json'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    else if (!path.extname(reqPath) && fs.existsSync(path.join(outDir, `${reqPath}.html`))) {
      reqPath = `${reqPath}.html`;
    }

    const filePath = path.join(outDir, reqPath);
    if (!filePath.startsWith(outDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  server.listen(port, () => {
    console.log(`⚡ stackr-site dev server running at http://localhost:${port}`);
    console.log(`   Watching ${srcDir} for Markdown, snippet, and config changes...`);
  });
} else {
  console.log(`stackr-site — Zero-dependency *stac.kr static site toolkit

Usage:
  stackr-site init [dir] [--name <brand>] [--mode light|dark]
  stackr-site build [dir] [-o <outDir>]
  stackr-site serve [dir] [-p <port>]
  stackr-site ascii <text>
`);
}
