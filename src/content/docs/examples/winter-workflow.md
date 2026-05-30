---
title: winter-workflow
description: The agentic workflow — agent roles and the blizzard, thaw, and review loops.
---

**[winter-workflow](https://github.com/paul-gross/winter-workflow)** adds an opinionated agentic workflow to a winter workspace: a set of role-pure agents and the skills that coordinate them into development loops.

It is a turnkey extension — add it to any winter workspace and the `/wf-*` skills and `wf-*` agents work immediately. It's grouped under [Examples](/winter-docs/examples/) because it is the maintainer's *personal* workflow: winter keeps the workflow a swappable component (the workspace is the stable integration surface), so adopt it as-is, or fork it as the starting point for your own.

## What it contributes

### Agent roles

Single-responsibility agents, symlinked into the workspace as `wf-<name>`. Each can be spawned standalone or composed into a team. The convention is *role purity*: agents do one job; the caller injects coordination.

| Agent | Role |
|-------|------|
| `architect` | High-level design, interface definitions, dependency analysis. |
| `developer` | Implements features and writes unit tests. |
| `explorer` | Investigates the codebase, traces data flows, gathers context. |
| `runner` | Manages application service lifecycle and reports output. |
| `test-mediator` | Coordinates test strategy — what to test and how. |
| `backend-verifier` | Tests APIs via curl/CLI and validates database state. |
| `frontend-verifier` | Drives the UI via Chrome DevTools to verify behavior. |
| `code-reviewer` | Reviews code changes for correctness and design. |
| `harness-reviewer` | Reviews the application↔harness seam against a diff. |
| `context-reviewer` | Reviews agent-facing markdown against the documented conventions. |
| `documentation-reviewer` | Reviews human-facing public documentation against the code and conventions. |

### Loops & skills

| Skill | What it does | Use when |
|-------|--------------|----------|
| `/wf-blizzard` | Turns the session into a lead agent that decomposes the work and delegates to a team of specialists. | Net-new features, multi-module refactors, design-level work. |
| `/wf-thaw` | A focused explorer → developer → verifier loop with a hard iteration cap; bails to a blizzard when the work is bigger than expected. | Small, localized changes to existing code — bug fixes, tweaks, regressions. |
| `/wf-cold-review` | Fresh-context `code-reviewer` with zero prior history. | An independent read on code correctness/design. |
| `/wf-harness-review` | Fresh-context `harness-reviewer`. | Checking whether the agentic harness keeps pace with the code. |
| `/wf-context-review` | Fresh-context `context-reviewer`. | Checking agent-facing markdown against the documented conventions. |
| `/wf-documentation-review` | Fresh-context `documentation-reviewer`. | Checking external-facing public documentation against the code it documents. |
| `/wf-harness-score` | Scores the codebase against a 5-stage × 10-dimension maturity matrix; emits an HTML report. | Tracking harness maturity over time. |
| `/wf-pre-push` | Fans out the reviewers the project's surfaces call for — code always, plus harness, context, and documentation reviewers when those surfaces exist — over `origin/master..HEAD`. | Before pushing completed work. |
| `/wf-commit` | Stages everything and writes a conventional-commit message inferred from the diff. | Committing a worktree. |

## What to take from it

Study winter-workflow when you want agents to do the heavy lifting — write code, run the app, verify their own changes, and review their own work — under a repeatable structure. Take the role-purity convention (agents do one job; the caller injects coordination), the blizzard/thaw split that matches ceremony to task size, and the reviewer pattern where each reviewer *reads the harness* for the facts it enforces rather than embedding them (see [`facts-vs-methodology.md`](https://github.com/paul-gross/winter-harness/blob/master/harness/facts-vs-methodology.md)). Then adapt the roles and loops to your team, or replace the whole workflow with your own.

## How it's wired in

As a real standalone repo, declared in `.winter/config.toml` like any other — examples are installed; only how the docs frame them differs:

```toml
[[standalone_repository]]
name = "winter-workflow"
url = "git@github.com:paul-gross/winter-workflow.git"
path = ".winter/ext/workflow"
```

After `winter ws init`, the `/wf-*` skills and `wf-*` agents are available. When a project documents no principles or test strategy, the blizzard team offers sensible defaults (SOLID + Clean Architecture, the test pyramid, CLI-driven test data). For your own workspace, fork it and point the `url` at your copy.

## Key conventions

- **Match the loop to the task** — blizzard for net-new/large, thaw for narrow/localized.
- **Review on multiple axes** — code (`/wf-cold-review`), harness (`/wf-harness-review`), agent-facing markdown (`context-reviewer`), and external-facing public documentation (`documentation-reviewer`) are distinct concerns.
- **Review before pushing** — `/wf-pre-push` is advisory and deliberately decoupled from the push itself.

:::note[Canonical source]
[`winter-workflow`](https://github.com/paul-gross/winter-workflow) — see its [`index.md`](https://github.com/paul-gross/winter-workflow/blob/master/index.md) and [`agents/README.md`](https://github.com/paul-gross/winter-workflow/blob/master/agents/README.md). The methodology is narrated in [Conventions & Patterns](/winter-docs/conventions/).
:::
