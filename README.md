# Rizafahmi.com Source

This repository contains the source code for [Rizafahmi.com](https://rizafahmi.com), a personal website powered by the [11ty/Eleventy](https://www.11ty.dev/) static site generator. The site is periodically updated and rebuilt to reflect new content, designs, or features.

## Project Overview

- **Technology**: Built with 11ty, using Nunjucks for templating and Markdown for content.
- **Purpose**: Personal blog and portfolio site.
- **Last Update**: A major redesign is planned for January 2024, inspired by the aesthetics of [https://www.chriis.dev/](https://www.chriis.dev/).

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) (16.x or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/rizafahmi.com.git
   cd rizafahmi.com
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

### Development

To start the development server with hot reload:

```sh
npm start
```

### Build

To build the site for development or production:

- Development build:
  ```sh
  npm run build
  ```
- Production build:
  ```sh
  npm run build:prod
  ```

### Debugging

Run the project with debug output enabled:

```sh
npm run debug
```

## Project Structure

- `src/`: Contains source files for pages, templates, styles, and assets.
- `dist/`: Output folder where the generated site is built.
- `*.njk`: Nunjucks templates.
- `*.md`: Markdown content and pages.
- Configuration files like `.eleventy.js` for Eleventy setup.

## Contribution Guidelines

We welcome contributions! Whether it's fixing a bug, adding a feature, or improving documentation, your help is appreciated.  

### Steps to Contribute:
1. Fork this repository.
2. Create a new branch:
   ```sh
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them.
4. Push your branch:
   ```sh
   git push origin feature/your-feature-name
   ```
5. Submit a Pull Request to this repository.

### Code Style

- Use 2-space indentation.
- Follow the JavaScript Standard Style for JavaScript files.
- Write descriptive variable and function names.
- Keep components small and maintain single responsibility.
- Organize imports: built-ins first, then dependencies, followed by local files.
- Use template literals and arrow functions where applicable.
- Name files and directories using kebab-case.
- Write all date-related text in Indonesian.

### Markdown Guidelines

- Use frontmatter for metadata (e.g., `title`, `description`).
- Follow proper heading hierarchy (H1 > H2 > H3).
- Add alt text to all images for accessibility.

## License

The source code of this project is licensed under [MIT License](LICENSE). Feel free to modify and use it for your own purposes.

## Contact

For inquiries or feedback, please submit via [GitHub Issues](https://github.com/rizafahmi/rizafahmi.com/issues).
