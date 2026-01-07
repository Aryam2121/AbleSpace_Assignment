# Contributing to Product Data Explorer

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a new branch for your feature/fix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

See [README.md](README.md) for detailed setup instructions.

## Code Style

### Backend (NestJS)
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Frontend (Next.js)
- Follow React best practices
- Use TypeScript for type safety
- Use functional components with hooks
- Keep components small and reusable
- Use Tailwind CSS for styling

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Add E2E tests for critical user flows

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Commit Messages

Follow conventional commits format:

```
feat: add product search functionality
fix: resolve caching issue in category page
docs: update API documentation
test: add tests for scraping service
```

## Pull Request Process

1. Update README.md with details of changes if needed
2. Update API.md if API changes are made
3. Ensure CI/CD pipeline passes
4. Request review from maintainers
5. Address any review comments

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on what is best for the community

## Questions?

Feel free to open an issue for any questions or concerns.
