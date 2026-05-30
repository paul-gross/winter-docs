---
title: Agentic Development Patterns
description: How agents develop software in winter — the hybrid harness/engineer mindset, role-pure agents, and the blizzard, thaw, and review loops.
---

Winter is built on the premise that **agents do the heavy lifting**: they write the code, run the app, verify their own changes, and review their own work. The patterns below — from [winter-workflow](/winter-docs/extensions/winter-workflow/) — are how that is organised.

## The hybrid harness/engineer mindset

An agent working in winter is both a software engineer (building the application) and a harness engineer (improving the environment that makes agentic work possible). When a doc is stale, you fix it where you find it; when a tool has a gap, you extend it. The four levers winter trusts most for agent productivity are:

- **Observability** — systems an agent can see into.
- **Testability** — systems an agent can verify.
- **Discoverability** — systems an agent can navigate.
- **Pluggability** — systems an agent can swap parts of.

## Role-pure agents

Work is done by single-responsibility agents. Each does one job; the *caller* injects coordination, so the same agent can run standalone or as a member of a team.

| Agent | Responsibility |
|-------|----------------|
| `architect` | High-level design, interface definitions, dependency analysis, architectural guardrails. |
| `backend-verifier` | Testing APIs via curl/CLI and validating database state. |
| `code-reviewer` | Assessing code changes for correctness and project standards. |
| `context-reviewer` | Reviewing agent-facing markdown against the documented conventions. |
| `developer` | Implementing features, unit tests, refactoring, bug fixes. |
| `documentation-reviewer` | Reviewing external-facing public documentation for accuracy and currency. |
| `explorer` | Investigating undocumented systems, tracing data flows, producing AI-centric docs. |
| `frontend-verifier` | Driving the UI in a browser to confirm rendering and interactions. |
| `harness-reviewer` | Reviewing the seam between the application and the agentic harness. |
| `runner` | Managing service lifecycle and monitoring logs for errors. |
| `test-mediator` | Coordinating test strategy and dispatching work to verifiers. |

## The loops

### Blizzard — `/wf-blizzard`

For net-new features, multi-module refactors, and design-level work. The session becomes a **lead** agent that decomposes the work and delegates to a team of specialists (architect, developer, verifiers, reviewer, runner, …). The lead orchestrates; teammates do the work.

### Thaw — `/wf-thaw`

For small, localized changes to existing code — a bug fix, a tweak, a regression. Composes `explorer → developer → verifier` standalone (no team), with a **hard iteration cap**, and bails up to a blizzard when the work turns out bigger than a thaw.

### Reviews

Review happens along distinct axes, each a fresh-context, one-shot subagent:

- **`code-reviewer`** — code correctness and design.
- **`harness-reviewer`** — whether the harness keeps pace with the code.
- **`context-reviewer`** — agent-facing markdown against conventions.
- **`documentation-reviewer`** — external-facing public documentation against the code it describes.

`code-reviewer` and `harness-reviewer` are also exposed standalone as `/wf-cold-review` and `/wf-harness-review`. **`/wf-pre-push`** fans out the applicable reviewers over the un-pushed range (`origin/master..HEAD`) and synthesises one advisory summary — which reviewers run depends on what the project has: a project with no docs site gets no documentation review, one with no agentic harness gets no harness review. Run it before pushing; it is deliberately decoupled from the push itself.

`/wf-harness-score` complements these by scoring the whole codebase against a 5-stage × 10-dimension maturity matrix.

## Delivery

Completed work lands directly on `master` — no PR flow, no long-lived feature branches:

- Each environment uses a Greek-letter branch locally and tracks a remote feature branch.
- **Rebase onto the latest `origin/master`** before pushing so history stays linear, with one commit per unit of work.
- Commit messages are **Conventional Commits with a scope**; `/wf-commit` infers the type, scope, and message from the diff.
- Close issues from commits with a `Closes #N` footer (`owner/repo#N` across repos).

The canonical delivery procedure is [`workflows/feature-delivery.md`](https://github.com/paul-gross/winter-harness/blob/master/workflows/feature-delivery.md); upstream-tracking for forked framework repos is [`workflows/upstream-tracking.md`](https://github.com/paul-gross/winter-harness/blob/master/workflows/upstream-tracking.md).

:::note[Canonical source]
[`winter-workflow`](https://github.com/paul-gross/winter-workflow) (roles and loops) and [`winter-harness/workflows/`](https://github.com/paul-gross/winter-harness/tree/master/workflows) (delivery). Adopter guide: [winter-workflow extension](/winter-docs/extensions/winter-workflow/).
:::
