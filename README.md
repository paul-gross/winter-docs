# Winter Docs

The documentation site for [Winter](https://github.com/paul-gross/winter) — a framework for agentic, multi-worktree, multi-repository development workspaces.

Built with [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/) and deployed to GitHub Pages at <https://paul-gross.github.io/winter-docs/>.

## Local development

Requires Node 22+ (see `engines` in `package.json`).

```sh
npm install       # install dependencies
npm run dev       # serve at http://localhost:4321/winter-docs/
```

## Build

```sh
npm run build     # output the static site to dist/
npm run preview   # preview the production build locally
```

A production build also emits `llms.txt`, `llms-full.txt`, and `llms-small.txt` via the [`starlight-llms-txt`](https://github.com/HiDeoo/starlight-llms-txt) plugin, so agents can consume the docs.

## Deployment

Pushes to `master` trigger the GitHub Actions workflow in `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. The `site`/`base` in `astro.config.mjs` are set for project-page hosting under `/winter-docs/`.
