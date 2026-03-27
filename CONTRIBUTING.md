# Contributing

Thanks for your interest in the CRE Acquisition Orchestrator! Contributions are welcome.

## How to Contribute

1. **Open an issue first** — Before starting work, open an issue describing what you'd like to change. This ensures we're aligned before you invest time.

2. **Fork and branch** — Fork the repo, create a feature branch from `main`.

3. **Make your changes** — Follow the existing code style and patterns.

4. **Test your changes** — Run the simulation and validation:
   ```bash
   npm run demo
   npm run validate
   npm run test:e2e
   ```

5. **Submit a PR** — Reference the issue in your pull request description.

## Running Locally

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/cre-acquisition-orchestrator.git
cd cre-acquisition-orchestrator

# Run the simulation
npm run demo

# Start the dashboard
npm run dashboard
# Dashboard available at http://localhost:5173
```

## Code Style

- JavaScript/Node.js for scripts and orchestration engine
- TypeScript + React for the dashboard
- Markdown for agent prompts and documentation
- JSON Schema for data contracts

## Questions?

Open an issue with the `question` label.
