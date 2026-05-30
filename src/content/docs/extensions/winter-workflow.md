---
title: winter-workflow
description: The agentic workflow — agent roles and the blizzard, thaw, and review loops.
---

**[winter-workflow](https://github.com/paul-gross/winter-workflow)** adds an opinionated agentic workflow to a winter workspace: a set of role-pure agents and the skills that coordinate them into development loops.

## What it contributes

### Agent roles

A set of single-responsibility agents, symlinked into the workspace as `wf-<name>`: `architect`, `developer`, `explorer`, `runner`, `test-mediator`, `backend-verifier`, `frontend-verifier`, `code-reviewer`, `harness-reviewer`, `context-reviewer`, and `documentation-reviewer`. Each can be spawned standalone or composed into a team. The convention is *role purity*: agents do one job; the caller injects coordination.

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

## When to adopt

Adopt winter-workflow when you want agents to do the heavy lifting — write code, run the app, verify their own changes, and review their own work — under a repeatable structure. The blizzard/thaw split lets you match ceremony to task size: a blizzard for big work, a thaw for a quick fix.

## How to configure

```toml
[[standalone_repository]]
name = "winter-workflow"
url = "git@github.com:paul-gross/winter-workflow.git"
path = ".winter/ext/workflow"
```

After `winter ws init`, the `/wf-*` skills and `wf-*` agents are available. When a project documents no principles or test strategy, the blizzard team offers sensible defaults (SOLID + Clean Architecture, the test pyramid, CLI-driven test data).

## Key conventions

- **Match the loop to the task** — blizzard for net-new/large, thaw for narrow/localized.
- **Review on multiple axes** — code (`/wf-cold-review`), harness (`/wf-harness-review`), agent-facing markdown (`context-reviewer`), and external-facing public documentation (`documentation-reviewer`) are distinct concerns.
- **Review before pushing** — `/wf-pre-push` is advisory and deliberately decoupled from the push itself.

:::note[Canonical source]
[`winter-workflow`](https://github.com/paul-gross/winter-workflow) — see its [`index.md`](https://github.com/paul-gross/winter-workflow/blob/master/index.md) and [`agents/README.md`](https://github.com/paul-gross/winter-workflow/blob/master/agents/README.md). The methodology is narrated in [Conventions & Patterns](/winter-docs/conventions/).
:::
