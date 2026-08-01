---
title: winter-workflow
description: The methodology product — reusable build and review operations with skill and agent adapters.
---

**[winter-workflow](https://github.com/paul-gross/winter-workflow)** adds an opinionated methodology product to a winter workspace. Here is one workflow; your workflow is your own.

Winter keeps the workflow a swappable component — the workspace is the stable integration surface — so winter-workflow is a turnkey option to adopt as-is or use as the starting point for a workflow of your own. Its reusable operations live under `methodology/`. Skills adapt those operations into the current session, while agents adapt bounded roles into isolated runtimes with their own context and tools. It's grouped under [Examples](/winter-docs/examples/) because it is the maintainer's *personal* workflow — one carried across many projects rather than reinvented per repo — that you can adopt or replace as the methodology evolves.

## Build operations

The build chooser maps the shape of the work to an operation and its session adapter:

| Session adapter | When to reach for it |
|-----------------|----------------------|
| **Glacier** | One feature — mid-sized or large — worked as ordered phases, each built and verified before the next; a phase's independent slices build in parallel. |
| **Flurry** | A batch of small, independent features, fanned out across environments in parallel — one commit each. |
| **Iceberg** | Ad hoc conversational work across several targets at once, via a standing foreman. It requires resident-worker coordination and returns `unsupported-capability` rather than substituting isolated runs when the runtime lacks that capability. See the [build chooser](https://github.com/paul-gross/winter-workflow/blob/master/methodology/build/index.md). |
| **Snowball** | A narrow fix to existing code — bug, tweak, or regression — on a capped explore → develop → verify loop. |

**Matching the operation to the problem.** These operations solve different kinds of problems. When you have many small items to manage, cut the overhead by running them in parallel across many feature environments with a flurry. When you face one large feature, conquer it with a glacier — a plan broken into ordered phases, each built and verified before the next, with a phase's independent slices built in parallel. And when the work arrives as a conversation rather than a plan, the iceberg foreman fans it out across targets and keeps everything moving at once.

## Review and pre-push loops

The [review process](https://github.com/paul-gross/winter-workflow/blob/master/methodology/review/process.md) supports focused reviews as well as a combined pre-push pass. Reviews run on demand rather than on every change because each one gives a fresh-context reviewer the relevant change-set. Glacier instead closes uncommitted work with a blocking multi-axis completion review; other build operations can use the advisory pre-push pass when their delivery flow calls for it.

The review operations are independently usable components. Their skills expose them to a session, so they can be composed with any build operation or invoked on their own:

| Skill | What it reviews |
|-------|----------------|
| **Cold review** | Code correctness and design — a fresh-context `cold-reviewer` over the change-set. |
| **Harness review** | Whether the agentic harness (agent context, verifier tooling) keeps pace with application change. |
| **Context review** | Agent-facing markdown, including agents, skills, entry points, and `context/` or `methodology/` docs, against the documented conventions. |
| **Documentation review** | External-facing public documentation against the code it documents. |
| **Pre-push** | Fans out the relevant reviewers over the un-pushed range and synthesizes an advisory summary. Deliberately decoupled from the push itself. |

Each single-axis review also accepts a remote PR or MR locator supported by an available, authenticated forge CLI. The skills bind axis defaults: code findings post inline, while context, harness, and documentation findings return as reports. A caller using the review process's normalized semantic inputs directly may explicitly override `scope.feedback` to `report` or `inline`; the skills do not expose that override until their adapter syntax adds it. Retrieval or posting failures are reported and never silently replaced with a local-branch review.

## Agent roles

Single-responsibility agents are isolated-runtime adapters. `winter ws init` transforms their canonical definitions into per-harness copies whose filenames carry the workspace's configured prefix. Claude Code and Codex invoke agents by the unprefixed canonical name; OpenCode invokes the prefixed projected filename. Projected roles can run as isolated one-shot agents when the harness supports that port; composing resident teams is a separate runtime capability. Methods such as Iceberg that require resident coordination return `unsupported-capability` when it is unavailable. The convention is *role purity*: agents do one job; a capable caller injects coordination.

Reviewer agents are not arbitrary standalone prompt endpoints. A direct caller must first normalize the axis, scope, and execution mode and supply the shared [review scaffold](https://github.com/paul-gross/winter-workflow/blob/master/methodology/review/process.md#execution-scaffold), including resolved targets and review material. The review skills perform that preparation for normal interactive use.

| Agent | Role |
|-------|------|
| `winter-architect` | High-level design, interface definitions, dependency analysis. |
| `ice-carver` | Implements features and writes unit tests. |
| `arctic-explorer` | Investigates the codebase, traces data flows, gathers context. |
| `backend-verifier` | Tests APIs via curl/CLI and validates database state. |
| `frontend-verifier` | Drives the UI via Chrome DevTools to verify behavior. |
| `cold-reviewer` | Reviews code changes for correctness and design. |
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

After `winter ws init`, skills are available under the configured prefix: they are symlinked for Claude Code and Codex and copied for OpenCode. Agents are projected as per-harness copies and use the harness-specific invocation identity described above. The operations still discover target-owned facts and invariants at runtime rather than carrying project-specific copies. When a project documents no principles, the `winter-architect` agent offers sensible defaults (SOLID + Clean Architecture). For your own workspace, fork it and point the `url` at your copy.

## Upgrade / migration

Existing adopters with custom references to winter-workflow method files under `context/` must update those references using the active [path-by-path migration map](https://github.com/paul-gross/winter-workflow/blob/master/MIGRATION.md). After updating workspace context, custom skills, agents, or automation, rerun `winter ws init` so winter reconciles symlinks and regenerates or copies projected artifacts. The removed paths have no compatibility stubs.

:::note[Canonical source]
[`winter-workflow`](https://github.com/paul-gross/winter-workflow) — start with its [methodology index](https://github.com/paul-gross/winter-workflow/blob/master/methodology/index.md), [build chooser](https://github.com/paul-gross/winter-workflow/blob/master/methodology/build/index.md), or [review process](https://github.com/paul-gross/winter-workflow/blob/master/methodology/review/process.md). The ownership model is explained in [Conventions & Patterns](/winter-docs/conventions/).
:::
