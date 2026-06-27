// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

// https://astro.build/config
export default defineConfig({
	site: 'https://paul-gross.github.io',
	base: '/winter-docs',
	integrations: [
		starlight({
			title: 'Winter',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/paul-gross/winter' },
			],
			plugins: [
				starlightLlmsTxt({
					projectName: 'Winter',
					description:
						'Winter is a framework for agentic, multi-worktree, multi-repository development workspaces.',
				}),
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'What is Winter?', slug: 'getting-started' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
						{ label: 'Glossary', slug: 'getting-started/glossary' },
					],
				},
				{
					label: 'Operations',
					items: [
						{ label: 'Overview', slug: 'operations' },
						{ label: 'Feature Environments & Worktrees', slug: 'operations/feature-environments' },
						{ label: 'Polyrepo Git Operations', slug: 'operations/polyrepo-git' },
						{ label: 'Provisioning Environments', slug: 'operations/provisioning' },
						{ label: 'Running Services', slug: 'operations/services' },
					],
				},
				{
					label: 'CLI Reference',
					items: [
						{ label: 'Overview', slug: 'cli-reference' },
						{ label: 'Workspace Lifecycle', slug: 'cli-reference/workspace-lifecycle' },
						{ label: 'Polyrepo Synchronization', slug: 'cli-reference/polyrepo-sync' },
						{ label: 'Repository & Extension Management', slug: 'cli-reference/repo-ext' },
						{ label: 'Environment Runtime', slug: 'cli-reference/environment-runtime' },
						{ label: 'Diagnostics & Introspection', slug: 'cli-reference/diagnostics' },
						{ label: 'Dashboard', slug: 'cli-reference/dashboard' },
						{ label: 'Global Reference', slug: 'cli-reference/global-reference' },
						{ label: 'config.toml Reference', slug: 'cli-reference/config' },
					],
				},
				{
					label: 'Extensions',
					items: [
						{ label: 'Overview', slug: 'extensions' },
						{ label: 'winter-product', slug: 'extensions/winter-product' },
						{ label: 'winter-service-tmux', slug: 'extensions/winter-service-tmux' },
						{ label: 'winter-service-docker', slug: 'extensions/winter-service-docker' },
						{ label: 'winter-github', slug: 'extensions/winter-github' },
					],
				},
				{
					label: 'Related Projects',
					items: [
						{ label: 'Overview', slug: 'related-projects' },
						{ label: 'winter-nvim', slug: 'related-projects/winter-nvim' },
					],
				},
				{
					label: 'Examples',
					items: [
						{ label: 'Overview', slug: 'examples' },
						{ label: 'winter-workflow', slug: 'examples/winter-workflow' },
						{ label: 'winter-harness', slug: 'examples/winter-harness' },
						{ label: 'winter-workspace', slug: 'examples/winter-workspace' },
					],
				},
				{
					label: 'TUI Plugins',
					items: [
						{ label: 'Overview', slug: 'tui-plugins' },
						{ label: 'Authoring', slug: 'tui-plugins/authoring' },
						{ label: 'Examples', slug: 'tui-plugins/examples' },
					],
				},
				{
					label: 'Conventions',
					items: [
						{ label: 'Overview', slug: 'conventions' },
						{ label: 'Canon', slug: 'conventions/canon' },
						{ label: 'Agent-Facing Context', slug: 'conventions/markdown-style' },
						{ label: 'Agentic Development Patterns', slug: 'conventions/agentic-patterns' },
					],
				},
			],
		}),
	],
});
