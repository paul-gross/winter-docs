---
title: winter-service-process-compose
description: process-compose service orchestration — one headless daemon per scope, the tmux manifest schema, and real readiness probes.
---

**[winter-service-process-compose](https://github.com/paul-gross/winter-service-process-compose)** provides service
orchestration through [process-compose](https://github.com/F1bonacci/process-compose). Each feature environment, and the
workspace scope, runs its own headless process-compose daemon, so several environments run the full stack side by side
without sharing sockets, ports, or process state. The extension implements the full `winter service` contract.

## What it contributes

- **`winter service up/down/status/restart/logs <env>`** dispatch, backed by one daemon per scope.
- **The tmux manifest schema** — it reads the same `[[service]]` entries `winter-service-tmux` reads, so an entry moves
  between the two providers unchanged. `[service.restart]` adds a native restart policy.
- **Real readiness** — a `health` of type `url` or `cmd` becomes a process-compose readiness probe, so
  `winter service up <env> --wait` blocks on a service that is not ready.
- **Reliable teardown** — `down` kills every process group, grandchildren included, and a daemon killed outright is
  recovered on the next `up` or `down`.
- **Logs without a daemon** — `winter service logs` reads per-service log files with timestamps, so it works after a
  stop.
- A **`winter doctor` probe** that fails with install guidance when `process-compose` is missing or older than 1.122.0.

## When to adopt

Use **winter-service-process-compose** when your services are native processes, you want real readiness and restart
policy without tmux, or your environment cannot run tmux. Use **winter-service-tmux** when you want interactive panes
you can attach to, and **winter-service-docker** for containerized shared infrastructure. All three implement the same
capability slot and can be bound together; each service is owned by exactly one provider.

## How to configure

```toml
# .winter/config.toml
[capabilities]
service = "winter-service-process-compose"

[[standalone_repository]]
name = "winter-service-process-compose"
url = "git@github.com:paul-gross/winter-service-process-compose.git"
path = ".winter/ext/service-process-compose"
```

Declare services in `.winter/config/winter-service-process-compose/config.toml`:

```toml
[[service]]
name = "api"
cmd = "uv run python -m app"
port = "WINTER_PORT_BASE + 1"

[service.health]
type = "url"
target = "http://localhost:${API_PORT}/health"

[service.restart]
policy = "on_failure"
```

`health.type` of `log` or `uptime`, an empty `cmd`, and cross-scope `depends_on` are refused. Install `process-compose`
1.122.0 or newer first.

:::note[Canonical source]
[`winter-service-process-compose`](https://github.com/paul-gross/winter-service-process-compose) — see its
[`index.md`](https://github.com/paul-gross/winter-service-process-compose/blob/master/index.md) and the `context/`
directory for the manifest schema and provider behavior. :::
