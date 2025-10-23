# Contributing to React Guardian

Thank you for your interest in contributing to React Guardian! This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/react-guardian.git
   cd react-guardian
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Available Scripts

- `npm run dev` - Start development mode with watch
- `npm run build` - Build the package
- `npm run test` - Run tests
- `npm run lint` - Run linter
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - Run TypeScript type checking

### Making Changes

1. Make your changes
2. Run tests: `npm test`
3. Run linter: `npm run lint`
4. Run type check: `npm run type-check`
5. Build the package: `npm run build`

### Testing

- Write tests for new features
- Ensure all existing tests pass
- Add tests for bug fixes
- Test in multiple browsers/environments

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Add JSDoc comments for public APIs
- Use meaningful variable and function names

## Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Add tests for your changes
3. Update documentation if needed
4. Submit a pull request with a clear description
5. Respond to feedback and make necessary changes

## Reporting Issues

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, React version)
- Code example if applicable

## Feature Requests

When suggesting features:

- Describe the use case
- Explain why it would be valuable
- Consider the impact on existing users
- Provide examples of how it would work

## Release Process

Releases are handled automatically through GitHub Actions when changes are merged to the main branch.

## Questions?

If you have questions, feel free to:

- Open an issue for discussion
- Contact the maintainers
- Join our community discussions

Thank you for contributing to React Guardian! 🛡️
