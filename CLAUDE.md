# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run clean` - Remove the dist directory
- `npm start` - Clean and start dev server with hot reload
- `npm run build` - Build site for development
- `npm run build:prod` - Build site for production 
- `npm run debug` - Run with debug output enabled

## Technology Stack
- 11ty/Eleventy (3.x) - Static site generator (ESM config: eleventy.config.js)
- Nunjucks (.njk) - Templating engine
- Markdown (.md) - Content files

## Code Style Guidelines
- Use 2-space indentation
- Follow JavaScript Standard Style for JS files
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Organize imports: built-ins first, then dependencies, then local modules
- File naming: use kebab-case for files and directories
- Keep component files small and focused on a single responsibility
- Use descriptive variable and function names
- For dates and time-related text, use Indonesian language

## Content Guidelines
- Markdown files should use frontmatter for metadata
- Use proper heading hierarchy (H1 > H2 > H3)
- Include alt text for all images