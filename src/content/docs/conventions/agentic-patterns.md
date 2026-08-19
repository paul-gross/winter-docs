---
title: Agentic Development Patterns
description: Implementation-independent design patterns for agentic systems — dependency inversion, single responsibility, open/closed context design, context derivation, derived delivery policy, and closed feedback loops.
---

The patterns on this page are not specific to any particular agent team, language, or toolchain. They describe
structural properties that make agentic systems coherent, evolvable, and correct.
[winter-workflow](/winter-docs/examples/winter-workflow/) is used as a worked example throughout; it is not the
definition of the patterns.

## Dependency inversion

A methodology operation reads target-owned facts and standards instead of embedding copies.

A code-review operation does not know which linter a project uses, which test framework it prefers, or what constitutes
an acceptable commit message — it discovers those facts from the target's own documentation and harness at runtime. This
keeps the methodology valid across projects. An operation that embeds facts it cannot control drifts as soon as those
facts change; one that reads them from the target stays current automatically.

See [Facts versus methodology](/winter-docs/conventions/canon/) in Canon for the principle behind this.

## Single responsibility

Each operation, adapter, convention document, and reviewer has one coherent role.

Role-pure agents — like `ice-carver`, `cold-reviewer`, `winter-architect`, and `backend-verifier` in winter-workflow —
adapt one role into an isolated runtime and do exactly one job. The *caller* injects coordination: task decomposition,
sequencing, and feedback routing. Projected isolated roles are available across supported harnesses, but team
composition depends on the active runtime's coordination capabilities; a method that requires resident workers cannot be
replaced by unrelated one-shot runs.

Single responsibility also applies to documents: a reusable operation has one owner, while a skill adapts it into the
current session and an agent adapts a role into an isolated runtime. In winter-workflow, those shared operations live
under `methodology/`; another product can choose a different truthful home. Neither adapter should replicate the
operation or the target's delivery facts.

## Open/closed context design

The review mechanism stays stable while project-specific standards change behind the harness discovery boundary.

The code-review relationship is the primary example. The
[review methodology](https://github.com/paul-gross/winter-workflow/blob/master/methodology/review/process.md) defines a
stable process — read the diff, read the target's standards, produce findings — and a `cold-reviewer` agent adapts its
bounded role to an isolated runtime. The standards are owned by the target and updated independently. Adding a new
linting rule, changing the test layout convention, or introducing a new architecture constraint does not require
changing the methodology or adapter; it requires updating the target's harness, which the reviewer discovers on its next
invocation.

This is the open/closed principle applied to context rather than to code: the generic mechanism is closed to
modification; the context it reads is open to extension.

## Context derivation

Agents do not receive a monolithic prompt containing every rule. They traverse a discoverable structure: entry point →
routing hub → applicable fact.

In practice, an entry point routes to the target-owned fact or invariant relevant to the task. A methodology product
separately routes to its reusable operations; winter-workflow keeps those under `methodology/` and loads them through
skill or agent adapters. Agents that do not touch the database do not read database conventions. Agents that do not push
do not read delivery conventions until delivery begins. The structure is the context architecture; the
[four Canon levers](/winter-docs/conventions/canon/) — observability, testability, discoverability, and pluggability —
determine how well that architecture performs.

## Delivery as derived policy

When delivery begins, an agent does not apply a hardcoded branch strategy or commit format. It discovers the target
project's delivery contract from the project's harness: which branch to target, what commit format to use, whether a
`Closes #N` footer is required, what tests or reviews must pass, where to push, and whether to open a pull request.

This makes the delivery methodology reusable across projects with different conventions and prevents it from
accumulating project-specific configuration. The target owns its delivery rules;
[winter-workflow's delivery methodology](https://github.com/paul-gross/winter-workflow/blob/master/methodology/delivery/index.md)
discovers and applies them. winter-context supplies winter-ecosystem facts and defaults about feature delivery and
artifact packaging, while winter-workflow owns the reusable procedures that apply those facts.

## Closed feedback loops

Agents can run, observe, verify, review, and feed discoveries back into code or context.

A developer agent that writes a failing test, runs it, reads the failure, and fixes the code is operating in a closed
loop. A harness-reviewer that reads the diff and the project's harness conventions to produce structured findings closes
the review loop without human mediation.

Closing feedback loops requires observability and testability — two of the
[four Canon levers](/winter-docs/conventions/canon/). An agent that cannot run the application, cannot observe its
state, or cannot read structured error output must defer to a human at each step, breaking the loop.

Winter-workflow's `/wf-pre-push` illustrates a closed review loop: its session adapter invokes reusable review
methodology, fans out isolated-runtime reviewer adapters over the unpushed range, synthesises one advisory summary, and
reports findings before the push. Which reviewers run depends on what the target has, derived from the target's own
harness.

:::note[Canonical source] [`winter-workflow`](https://github.com/paul-gross/winter-workflow) (reusable procedures and
adapters as worked examples) and [`winter-context`](https://github.com/paul-gross/winter-context) (winter-ecosystem
feature-delivery and artifact-packaging facts and defaults). Adopter guide:
[winter-workflow example](/winter-docs/examples/winter-workflow/). :::
