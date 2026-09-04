---
name: run-rategoan
description: Build, run, and drive Rategoan (the RAGET chat PWA). Use when asked to start Rategoan, take a screenshot of it, test a chat/document/offline flow, run its bench/lint, or interact with the running app.
---

Rategoan is a static PWA (vanilla ES6 modules, no build step, no
framework) that serves a rule-based Indonesian chat assistant. Drive it
by starting the static file server, then controlling a headless
Chromium via the REPL driver at
`.claude/skills/run-rategoan/driver.mjs`.

All paths below are relative to the repo root.

## Prerequisites

Nothing to install in this container - Playwright ships preinstalled
globally at `/opt/node22/lib/node_modules/playwright` and the driver
imports it from that absolute path (see Gotchas if that path doesn't
exist on a different machine).

```bash
node --version   # verified with v22.22.2
```

## Build

None. `package.json` only holds dev tooling (lint/bench), not an app
build - the app itself is plain static files.

## Run (agent path)

1. Start the static server (from repo root) and wait for it to answer:

```bash
python3 -m http.server 8099 &
timeout 15 bash -c 'until curl -sf http://localhost:8099/index.html >/dev/null; do sleep 0.5; done'
```

2. Launch the driver REPL under tmux and drive it:

```bash
tmux new-session -d -s rategoan-drv -x 200 -y 50
tmux send-keys -t rategoan-drv 'node .claude/skills/run-rategoan/driver.mjs' Enter
timeout 15 bash -c 'until tmux capture-pane -t rategoan-drv -p | grep -q "driver>"; do sleep 0.3; done'

tmux send-keys -t rategoan-drv 'launch' Enter
timeout 20 bash -c 'until tmux capture-pane -t rategoan-drv -p | grep -q "launched\."; do sleep 0.3; done'

tmux send-keys -t rategoan-drv 'auth' Enter
timeout 15 bash -c 'until tmux capture-pane -t rategoan-drv -p | grep -q "authed"; do sleep 0.3; done'

tmux send-keys -t rategoan-drv 'ss landing' Enter
timeout 15 bash -c 'until tmux capture-pane -t rategoan-drv -p | grep -q "screenshot:"; do sleep 0.3; done'
tmux capture-pane -t rategoan-drv -p
```

Then actually open the screenshot file it printed (default
`/tmp/shots/<name>.png`, override with `SCREENSHOT_DIR`).

Stop when done: `tmux send-keys -t rategoan-drv 'quit' Enter; tmux kill-session -t rategoan-drv`.

### Commands

| command | what it does |
|---|---|
| `launch` | launch headless Chromium (390x844 mobile viewport) |
| `auth` | seed `localStorage['rategoan_auth']` + reload - bypasses the login gate (see Gotchas) |
| `nav [path\|url]` | goto a path relative to `http://localhost:8099/` (default `index.html`), or an absolute URL |
| `ss [name]` | screenshot -> `/tmp/shots/<name>.png` |
| `click <css-sel>` | click element |
| `click-text <text>` | click button/link/`[role=button]` containing text |
| `fill <css-sel> <text>` | fill an input/textarea |
| `type <text>` / `press <key>` | keyboard input |
| `setfile <css-sel> <abs-path>` | attach a file to an `<input type=file>` (e.g. `#pick-file`) |
| `wait <css-sel>` | wait for element, 10s timeout |
| `eval <js>` | evaluate in the page, print JSON |
| `text [css-sel]` | print innerText (body if no selector) |
| `offline [on\|off]` | toggle `context.setOffline()` - for testing the PWA's offline app-shell |
| `console` | print collected `console.error`/`pageerror` since launch |
| `quit` | close browser, exit |

## Run (human path)

```bash
python3 -m http.server 8099
# open http://localhost:8099/index.html in a real browser
```

## Test

```bash
npm run lint    # syntax + ESLint (correctness rules only), must show "HASIL: LOLOS"
npm run bench http://localhost:8099   # CORE-SUITE, needs the server running - slow (~1000+ cases)
```

`npm run lint` verified in this session: `Syntax check: 0 error`,
`ESLint ... Error: 0 | Warning: 34`, `HASIL: LOLOS`.

---

## Gotchas

- **Every route is login-gated.** `js/core/router.js` force-redirects
  to `#/login` unless `localStorage['rategoan_auth']` is set - there is
  no real backend auth, `login()` just writes
  `{method,id,time}` to that key. The driver's `auth` command does
  this correctly: `goto()` once to establish the origin, `evaluate()`
  to seed localStorage, then `goto()` again so `router.js` picks it up
  on boot. A single `goto()` + `evaluate()` without the second reload
  leaves you on the login screen.
- **Two harmless `net::ERR_CONNECTION_RESET` console errors after
  `auth`.** Artifact of the double-`goto()` (the first navigation's
  in-flight requests get cancelled by the second). Not an app bug -
  confirmed by clicking `#btn-send` right after and getting a normal
  reply with zero further errors.
- **`click #btn-send` before the composer is idle can no-op.** Fill the
  input first (`fill #chat-input ...`), then click - matches how a real
  user would type-then-send.
- **`/opt/node22/lib/node_modules/playwright` is this container's
  global Playwright install.** `package.json` lists `playwright` as a
  devDependency but `npm install` was never run in this repo (no local
  `node_modules/`) - the driver imports the global path directly. On a
  different machine without that path, run `npm install` and change the
  driver's import to plain `from 'playwright'`.
- **ESLint doesn't know Node globals by default** (the project's
  `eslint.config.mjs` targets browser code) - `.claude/skills/**/*.mjs`
  was added to the same node-globals allowlist that already covered
  `raget/raget-tools/**`, so `npm run lint` passes on this driver.

## Troubleshooting

- **`EADDRINUSE` on port 8099:** a previous server is still running -
  `lsof -ti:8099 -sTCP:LISTEN | xargs -r kill` before restarting.
- **Driver stuck on `driver>` after `auth`, no output yet:** the first
  `goto()` after a cold Chromium launch can take several seconds -
  poll longer (`timeout 15` was tight in one run; `timeout 20` is safer).
- **`click #btn-send -> ERROR: ... Timeout`:** element hidden or not
  yet in the DOM - `ss` first to see actual page state, or `wait
  #btn-send` before clicking.
