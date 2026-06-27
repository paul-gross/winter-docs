---
title: winter-workflow
description: The agentic workflow — agent roles and the build and review loops.
---

**[winter-workflow](https://github.com/paul-gross/winter-workflow)** adds an opinionated agentic workflow to a winter workspace. Here is one workflow; your workflow is your own.

Winter keeps the workflow a swappable component — the workspace is the stable integration surface — so winter-workflow is a turnkey option to adopt as-is or use as the starting point for a workflow of your own. Add it to any workspace and the `/wf-*` skills and `wf-*` agents work immediately. It's grouped under [Examples](/winter-docs/examples/) because it is the maintainer's *personal* workflow — one carried across many projects, the same `/wf-*` skills reused everywhere rather than reinvented per repo — that you can adopt or replace as the methodology evolves.

## Build skills

The five build skills map to the shape of the work:

| Skill | When to reach for it |
|-------|---------------------|
| **Blizzard** | One large feature, built by a coordinated team — architect, developer, verifier, and reviewer in one session. |
| **Glacier** | One mid-sized feature, worked as ordered phases — each built and verified before the next. |
| **Flurry** | A batch of small, independent features, fanned out across environments in parallel — one commit each. |
| **Delegate** | Ad hoc conversational work across several targets at once, via a standing foreman. See [choosing-a-build-skill](https://github.com/paul-gross/winter-workflow/blob/master/ai/choosing-a-build-skill.md). |
| **Thaw** | A narrow fix to existing code — bug, tweak, or regression — on a capped explore → develop → verify loop. |

**Matching the skill to the problem.** These skills solve different kinds of problems. When you have many small items to manage, cut the overhead by running them in parallel across many feature environments with a flurry. When you face one large feature, conquer it with a blizzard — a team of agents that breaks the work down, distributes it to developers, and validates the result. And the tried-and-true single-agent workflow, glacier, is still a wonderful choice when one feature simply wants steady, focused attention.

## Review and pre-push loops

The review process is keyed specifically off the **pre-push** verbiage — asking to review before pushing is what triggers it. Because each reviewer fans out fresh-context agents across its axis, the loops carry a high token cost, so they are meant to run on demand rather than on every change. When you do run them they often improve the quality of the work substantially, and are generally worth invoking before you evaluate the output of a build workflow. Some build skills bake a pre-push activation directly into their flow.

The review skills are independently usable components, composable with any build skill or invoked on their own:

| Skill | What it reviews |
|-------|----------------|
| **Cold review** | Code correctness and design — a fresh-context `code-reviewer` over the change-set. |
| **Harness review** | Whether the agentic harness (agent context, verifier tooling) keeps pace with application change. |
| **Context review** | Agent-facing markdown (agents, skills, `CLAUDE.md`, `ai/` docs) against the documented conventions. |
| **Documentation review** | External-facing public documentation against the code it documents. |
| **Pre-push** | Fans out the relevant reviewers over the un-pushed range and synthesizes an advisory summary. Deliberately decoupled from the push itself. |

## Agent roles

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

## How it's wired in

As a real standalone repo, declared in `.winter/config.toml` like any other — examples are installed; only how the docs frame them differs:

```toml
[[standalone_repository]]
name = "winter-workflow"
url = "git@github.com:paul-gross/winter-workflow.git"
path = ".winter/ext/workflow"
```

After `winter ws init`, the `/wf-*` skills and `wf-*` agents are available. When a project documents no principles or test strategy, the blizzard team offers sensible defaults (SOLID + Clean Architecture, the test pyramid, CLI-driven test data). For your own workspace, fork it and point the `url` at your copy.

:::note[Canonical source]
[`winter-workflow`](https://github.com/paul-gross/winter-workflow) — see its [`index.md`](https://github.com/paul-gross/winter-workflow/blob/master/index.md) and [`agents/README.md`](https://github.com/paul-gross/winter-workflow/blob/master/agents/README.md). The methodology is narrated in [Conventions & Patterns](/winter-docs/conventions/).
:::
