---
description: demo-stackr — built for humans and AI coding agents.
---

# One Command. Built For You and Your Agent.

Coordinate your stack with zero config friction. Driven by a single file in your repo and built as a first-class citizen for both humans and AI coding agents.

:::cta
- `npx demo-stackr`
- [View on GitHub](https://github.com/eliotstocker/demo-stackr){.btn-primary}
:::

:::prompt 🤖 Prompt for Claude, Cursor, Copilot & Gemini
Use demo-stackr (https://demo-stackr.kr/llms.txt) in this workspace.
Run `npx demo-stackr init` to bootstrap the configuration and inspect live status via MCP.
:::

{{include:snippets/demo.html}}

## How It Works {#how-it-works}

An end-to-end automated workflow from local setup to production.

:::flow
### Initialize in One Command
- **Zero Boilerplate**: Run `npx demo-stackr init` and let your installed CLI agent inspect your repo and generate the config.
- **Instant Validation**: Checks ports, dependencies, and environment variables before startup.

### Live Agent & Human Control
- **MCP Native**: Expose live logs, status, and actions directly to Claude, Cursor, or Antigravity.
- **Hot Reload**: Modify config on the fly without tearing down running services.
:::

## Features {#features}

Everything you need without the bloat.

:::features
### Dependency-Ordered Startup
Declare `dependsOn` between services and tools so everything boots in topological order.

### Real Liveness Checks
Port, HTTP, or custom shell command checks flip services to *ready* only when they can actually take traffic.

### Agent-First Surface
Built-in `mcp` server and `llms.txt` specification so your coding agent sees what you see.
:::

## CLI Commands {#cli}

Operate natively from your terminal or agent tool calls:

:::cli
- `demo-stackr init`: Inspect the workspace and generate a starter config using your CLI agent.
- `demo-stackr up`: Start all services in topological dependency order with live TUI tabs.
- `demo-stackr mcp`: Start the Model Context Protocol server over stdio or HTTP.
- `demo-stackr status --json`: Output deterministic machine-readable state for AI agents.
:::

## Built for You *and* Your AI Coding Agent {#agents}

Not a human-facing UI with an API bolted on after the fact — the agent-facing surface is a first-class citizen.

- `demo-stackr init` hands an agent the job of writing your config in the first place.
- `demo-stackr mcp` lets an agent read status/logs or trigger actions mid-session without leaving its context.
