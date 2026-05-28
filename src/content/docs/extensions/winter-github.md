---
title: winter-github
description: AI-native GitHub issue tooling — draft and file precisely-formatted issues via the gh CLI.
---

**[winter-github](https://github.com/paul-gross/winter-github)** lets you raise GitHub issues from a winter workspace in a precise, AI-native format, filed through the [`gh`](https://cli.github.com/) CLI.

## What it contributes

- **`/wg-issue`** skill — drafts an issue from the current conversation plus your arguments, picks the target GitHub repository, confirms with you, and files it via `gh issue create`.
- **An AI-native issue format** — a consistent structure that is easy for agents to produce and to act on:
  - YAML metadata (`type`, `complexity`, `related`)
  - **Context** — why the issue exists
  - **Current Behavior** / **Desired Behavior**
  - **Acceptance Criteria** — a checklist
  - **Out of Scope**
  - **References**

## When to adopt

Adopt winter-github when your repos live on GitHub and you want issues that are structured enough for an agent to pick up and implement directly — the same format the doc-pass and feature tickets in winter itself use. It relies on the convention that all GitHub interaction goes through `gh` rather than the web UI.

## How to configure

```toml
[[standalone_repository]]
name = "winter-github"
url = "git@github.com:paul-gross/winter-github.git"
path = ".winter/ext/github"
```

Authenticate the `gh` CLI once (`gh auth login --hostname github.com`); winter-github reuses that auth context. After `winter ws init`, `/wg-issue` is available.

## Key conventions

- **File issues with `/wg-issue`**, not by hand — it enforces the format and probes existing labels.
- **Mirror the canonical label set** (`type:*` / `complexity:*`) on every repo before filing the first issue.
- **Close issues from commits** with a `Closes #N` footer (or `owner/repo#N` across repos) so there's a paper trail linking the commit and the issue.
- **All GitHub interaction goes through `gh`** — issues, PRs, releases, and API calls (`gh api`), never the web UI.

:::note[Canonical source]
[`winter-github`](https://github.com/paul-gross/winter-github) — see its [`index.md`](https://github.com/paul-gross/winter-github/blob/master/index.md) and the issue-format spec under `ai/`.
:::
