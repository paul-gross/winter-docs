---
title: Agentic Development Patterns
description: Implementation-independent design patterns for agentic systems — dependency inversion, single responsibility, open/closed context design, context derivation, derived delivery policy, and closed feedback loops.
---

The patterns on this page are not specific to any particular agent team, language, or toolchain. They describe structural properties that make agentic systems coherent, evolvable, and correct. [winter-workflow](/winter-docs/examples/winter-workflow/) is used as a worked example throughout; it is not the definition of the patterns.

## Dependency inversion

A workflow or reviewer reads project-owned facts and standards instead of embedding copies.

A code-review workflow does not know which linter a project uses, which test framework it prefers, or what constitutes an acceptable commit message — it discovers those facts by reading the project's harness at runtime. This keeps the generic workflow valid across projects. A workflow that embeds facts it cannot control drifts as soon as those facts change; a workflow that reads them from the project's harness stays current automatically.

See [Facts versus methodology](/winter-docs/conventions/canon/) in Canon for the principle behind this.

## Single responsibility

Each agent, skill, convention document, and reviewer has one coherent role.

Role-pure agents — like `developer`, `code-reviewer`, `architect`, and `backend-verifier` in winter-workflow — do exactly one job. The *caller* injects coordination: task decomposition, sequencing, and feedback routing. The same agent can run standalone or as part of a team without changing its own behavior.

Single responsibility also applies to documents: a skill should describe how to invoke a workflow, not replicate the project's delivery conventions. A convention file should state one rule, not be a catch-all for the author's working notes.

## Open/closed context design

The review mechanism stays stable while project-specific standards change behind the harness discovery boundary.

The code-review relationship is the primary example. A `code-reviewer` agent applies a fixed process — read the diff, read the project's standards, produce findings. The standards are owned by the project and updated independently. Adding a new linting rule, changing the test layout convention, or introducing a new architecture constraint does not require changing the reviewer; it requires updating the project's harness, which the reviewer discovers on its next invocation.

This is the open/closed principle applied to context rather than to code: the generic mechanism is closed to modification; the context it reads is open to extension.

## Context derivation

Agents do not receive a monolithic prompt containing every rule. They traverse a discoverable structure: entry point → routing hub → applicable fact.

In practice: a `CLAUDE.md` routes to a `context/` index, which routes to a specific convention file, which the agent reads when the task matches. Agents that do not touch the database do not read database conventions. Agents that do not push do not read delivery conventions until delivery begins. The structure is the context architecture; the [four Canon levers](/winter-docs/conventions/canon/) — observability, testability, discoverability, and pluggability — determine how well that architecture performs.

## Delivery as derived policy

When delivery begins, an agent does not apply a hardcoded branch strategy or commit format. It discovers the target project's delivery contract from the project's harness: which branch to target, what commit format to use, whether a `Closes #N` footer is required, what tests or reviews must pass, where to push, and whether to open a pull request.

This makes the delivery workflow reusable across projects with different conventions and prevents the workflow from accumulating project-specific configuration. The project owns its delivery rules; the workflow knows how to find and apply them. The canonical delivery workflow in winter-harness demonstrates this — it reads branch, commit, and push rules from the project before acting, rather than prescribing them.

## Closed feedback loops

Agents can run, observe, verify, review, and feed discoveries back into code or context.

A developer agent that writes a failing test, runs it, reads the failure, and fixes the code is operating in a closed loop. A harness-reviewer that reads the diff and the project's harness conventions to produce structured findings closes the review loop without human mediation.

Closing feedback loops requires observability and testability — two of the [four Canon levers](/winter-docs/conventions/canon/). An agent that cannot run the application, cannot observe its state, or cannot read structured error output must defer to a human at each step, breaking the loop.

Winter-workflow's `/wf-pre-push` illustrates a closed review loop: it fans out applicable reviewers over the unpushed range, synthesises one advisory summary, and reports findings before the push — which reviewers run depends on what the project has, derived from the project's own harness.

:::note[Canonical source]
[`winter-workflow`](https://github.com/paul-gross/winter-workflow) (roles and workflows as worked examples) and [`winter-harness`](https://github.com/paul-gross/winter-harness) (conventions). Adopter guide: [winter-workflow example](/winter-docs/examples/winter-workflow/).
:::
