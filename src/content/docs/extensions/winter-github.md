---
title: winter-github
description: AI-native GitHub issue tooling — draft and file precisely-formatted issues, and close the ideation-to-delivery loop via the gh CLI.
---

**[winter-github](https://github.com/paul-gross/winter-github)** lets you raise GitHub issues from a winter workspace in a precise, AI-native format, filed through the [`gh`](https://cli.github.com/) CLI. It is the bridge between an idea in conversation and a structured work item an agent can implement directly.

## The ideation-to-delivery loop

winter-github is designed around a complete loop:

1. **Ideation** — a user describes a feature, bug, or improvement in conversation with an agent.
2. **Structured issue** — the agent runs `/wg-issue`, which drafts an issue in a consistent format, confirms with the user, and files it via `gh issue create`.
3. **Context preservation** — the issue records why the work exists, the current behavior, the desired behavior, acceptance criteria, out-of-scope constraints, and references. This context survives context-window resets and is readable by any agent.
4. **Implementation prompt** — a build skill (`glacier`, `flurry`, `thaw`) reads the issue as its specification. The structured format — especially **Acceptance Criteria** and **Out of Scope** — is what the agent implements against.
5. **Commit and PR** — commits include a `Closes #N` footer (or `owner/repo#N` across repos) so the commit and the issue link bidirectionally, and GitHub closes the issue automatically on merge.
6. **New findings** — anything discovered during implementation that is out of scope for the current issue becomes a new issue, keeping the backlog growing from real work rather than speculation.

The loop can run entirely agent-driven: the user ideates, the agent captures the issue, the issue drives implementation, and new findings return to the backlog — all without the user leaving the conversation.

## What it contributes

- **`/wg-issue`** skill — drafts an issue from the current conversation plus your arguments, picks the target GitHub repository, confirms with you, and files it via `gh issue create`.
- **`/wg-refine`** skill — updates an existing issue's body, labels, or title in the same AI-native format, either interactively or by processing inline `--comments` requests on the issue.
- **An AI-native issue format** — a consistent structure that is easy for agents to produce and to act on:
  - YAML metadata (`type`, `complexity`, `related`)
  - **Context** — why the issue exists
  - **Current Behavior** / **Desired Behavior**
  - **Acceptance Criteria** — a checklist
  - **Out of Scope**
  - **References**
- **A `winter doctor` probe** (`scripts/doctor.sh`) that checks the `gh` CLI is installed, authenticated for `github.com`, and that `api.github.com` is reachable — so a missing prerequisite surfaces before you try to file.

## Boundary with winter-product

winter-github and winter-product address different scopes:

- **winter-github** owns **GitHub issue capture and transport** — the format, the filing mechanism, and the commit-closure convention. It does not maintain a local backlog; it files directly to GitHub and uses GitHub's issue tracker as the backlog.
- **winter-product** adds a **broader product and backlog methodology** — a file-based backlog in git (`backlog/` / `work/` / `archive/`), item lifecycle (backlog → work → archive), and planning agents. It does not require GitHub, and its items are not GitHub issues.

The two can coexist: use winter-product for the local planning cycle (shaping work, writing technical approaches, tracking in-progress items) and winter-github to file the resulting tickets to GitHub so they are visible outside the workspace and closeable from commits.

## When to adopt

Adopt winter-github when your repos live on GitHub and you want issues that are structured enough for an agent to pick up and implement directly — the same format the doc-pass and feature tickets in winter itself use. It relies on the convention that all GitHub interaction goes through `gh` rather than the web UI.

## How to configure

```toml
[[standalone_repository]]
name = "winter-github"
url = "git@github.com:paul-gross/winter-github.git"
path = ".winter/ext/github"
```

Authenticate the `gh` CLI once (`gh auth login --hostname github.com`); winter-github reuses that auth context. After `winter ws init`, `/wg-issue` and `/wg-refine` are available.

## Key conventions

- **File issues with `/wg-issue`**, not by hand — it enforces the format and probes existing labels.
- **Mirror the canonical label set** (`type:*` / `complexity:*`) on every repo before filing the first issue.
- **Close issues from commits** with a `Closes #N` footer (or `owner/repo#N` across repos) so there's a paper trail linking the commit and the issue.
- **All GitHub interaction goes through `gh`** — issues, PRs, releases, and API calls (`gh api`), never the web UI.

:::note[Canonical source]
[`winter-github`](https://github.com/paul-gross/winter-github) — see its [`index.md`](https://github.com/paul-gross/winter-github/blob/master/index.md) and the issue-format spec under `context/`.
:::
