# 🔥 DevForge CLI

<p align="center">
  <strong>Supercharge your development workflow with intelligent project scaffolding</strong>
</p>

<p align="center">
  <em>Stop wasting hours on project setup. Start building what matters.</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/devforge-cli">
    <img src="https://img.shields.io/npm/v/devforge-cli.svg?style=flat-square&color=brightgreen" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/devforge-cli">
    <img src="https://img.shields.io/npm/dm/devforge-cli.svg?style=flat-square&color=blue" alt="npm downloads" />
  </a>
  <a href="https://github.com/yourusername/devforge-cli/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/yourusername/devforge-cli/ci.yml?branch=main&style=flat-square" alt="Build Status" />
  </a>
  <a href="https://codecov.io/gh/yourusername/devforge-cli">
    <img src="https://img.shields.io/codecov/c/github/yourusername/devforge-cli?style=flat-square" alt="Code Coverage" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/npm/l/devforge-cli.svg?style=flat-square&color=orange" alt="License" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  </a>
</p>

<p align="center">
  <a href="#-quick-start"><strong>🚀 Quick Start</strong></a> •
  <a href="#-documentation"><strong>📖 Documentation</strong></a> •
  <a href="#-why-devforge"><strong>🎯 Why DevForge?</strong></a> •
  <a href="#-contributing"><strong>🤝 Contributing</strong></a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/yourusername/devforge-cli/main/demo.gif" alt="DevForge CLI Demo" width="680" />
</p>

---

## 🎯 Why DevForge?

> **"From idea to deployment in minutes, not hours"**

Every developer knows the pain:
- ⏰ **Hours wasted** on repetitive project setup
- 🔧 **Inconsistent tooling** across different projects  
- 📚 **Forgetting best practices** from previous projects
- 🐛 **Copy-paste errors** that break builds

**DevForge eliminates these problems** with intelligent, battle-tested project templates that include everything you need to start building immediately.

## ✨ What Makes DevForge Special

| Feature | Description |
|---------|-------------|
| 🚀 **Lightning Fast Setup** | Complete project ready in < 30 seconds |
| 🧠 **AI-Powered Intelligence** | Smart dependency analysis & code suggestions |
| 🔌 **Extensible Plugin System** | Custom templates & community plugins |
| 🛡️ **Production-Ready Defaults** | TypeScript, testing, CI/CD, linting included |
| 🎨 **Multiple Project Types** | Node.js, React, Express, and custom templates |
| ⚡ **Developer Experience** | Interactive prompts, progress indicators, caching |

## 🚀 Quick Start

### Install DevForge CLI

```bash
# Install globally
npm install -g devforge-cli

# Or use directly with npx
npx devforge-cli --version
```

### Create Your First Project

```bash
# Interactive mode - guided setup
devforge create my-awesome-app

# Quick mode - use defaults
devforge create my-api --template express-api --skip-prompts

# Initialize existing project
devforge init
```

### Available Templates

```bash
devforge template list
```

| Template | Description | Tech Stack |
|----------|-------------|------------|
| `node-typescript` | Node.js with TypeScript | Node.js, TypeScript, Vitest, ESLint |
| `react-vite` | Modern React app | React, Vite, TypeScript, Tailwind CSS |
| `express-api` | RESTful API server | Express, TypeScript, Jest, Swagger |

## 📚 Documentation

### Core Commands

```bash
# Create new project
devforge create <project-name> [options]

# Initialize existing project  
devforge init [options]

# Manage templates
devforge template <command>

# Manage plugins
devforge plugin <command>

# Show help
devforge --help
```

### Configuration

Create a `devforge.config.js` file in your project root:

```javascript
module.exports = {
  templates: {
    directory: './custom-templates'
  },
  plugins: [
    '@devforge/ai-docs',
    '@devforge/code-analysis'
  ],
  cache: {
    enabled: true,
    ttl: 3600
  }
}
```

### Plugin Development

```javascript
// my-plugin.js
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',
  hooks: {
    'project:created': async (context) => {
      // Your plugin logic here
    }
  }
}
```

## 🌟 Examples

<details>
<summary><strong>Creating a full-stack TypeScript project</strong></summary>

```bash
devforge create my-fullstack-app
```

This creates:
- ✅ TypeScript configuration
- ✅ ESLint + Prettier setup  
- ✅ Vitest testing framework
- ✅ GitHub Actions CI/CD
- ✅ Pre-commit hooks
- ✅ Package.json with scripts
- ✅ README with badges
- ✅ License file

</details>

<details>
<summary><strong>Setting up a React project with Tailwind</strong></summary>

```bash
devforge create my-react-app --template react-vite
```

Includes:
- ⚡ Vite for blazing fast development
- 🎨 Tailwind CSS for styling
- 🧪 Vitest + React Testing Library
- 📱 Responsive design templates
- 🔧 TypeScript support

</details>

<details>
<summary><strong>Express API with OpenAPI documentation</strong></summary>

```bash
devforge create my-api --template express-api
```

Features:
- 🚀 Express.js server
- 📝 OpenAPI/Swagger documentation
- 🔐 JWT authentication setup
- 🗄️ Database integration examples
- 🧪 Comprehensive test suite

</details>

## 🔧 Advanced Usage

### Custom Templates

Create your own templates in `~/.devforge/templates/`:

```
my-template/
├── template.json          # Template configuration
├── {{project-name}}/     # Template files
│   ├── package.json
│   ├── src/
│   └── tests/
└── hooks/                # Template hooks
    ├── pre-install.js
    └── post-install.js
```

### Environment-Specific Configurations

```bash
# Development setup
devforge create my-app --env development

# Production-ready setup
devforge create my-app --env production --ci github-actions
```

## 🤝 Contributing

We love contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `npm test`
5. **Submit a pull request**

### Development Setup

```bash
git clone https://github.com/yourusername/devforge-cli.git
cd devforge-cli
npm install
npm run dev
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # Integration tests
npm run test:watch    # Watch mode
```

## 📊 Project Stats

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=yourusername&repo=devforge-cli&show_icons=true&theme=dark" alt="GitHub Stats" />
</p>

## 🙏 Acknowledgments

- Built with [TypeScript](https://www.typescriptlang.org/) for type safety
- Powered by [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) for interactive prompts
- Styled with [Chalk](https://github.com/chalk/chalk) for beautiful terminal output
- Tested with [Vitest](https://vitest.dev/) for lightning-fast testing

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://devforge-cli.dev)
- [npm Package](https://www.npmjs.com/package/devforge-cli)
- [Issues](https://github.com/yourusername/devforge-cli/issues)
- [Discussions](https://github.com/yourusername/devforge-cli/discussions)

---

<p align="center">
  <strong>Made with ❤️ by developers, for developers</strong>
</p>

<p align="center">
  <a href="https://github.com/yourusername/devforge-cli">⭐ Star this project</a> if you find it helpful!
</p>
