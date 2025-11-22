# Contributing to ProofSight Protocol

Thank you for your interest in contributing to ProofSight! This document provides guidelines and instructions for contributors.

## Development Setup

### Prerequisites

- Node.js 18+ 
- Rust / Cargo (for Solana programs)
- Python 3.10+ (for research simulations)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ProofSightTeam/ProofSight-protocol.git
cd ProofSight-protocol

# Install SDK dependencies
cd sdk && npm install && cd ..

# Install circuit dependencies
cd circuits && npm install && cd ..
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Run Tests

```bash
# SDK tests
cd sdk && npm test

# Circuit tests
cd circuits && npm test
```

### 4. Commit Changes

```bash
git add .
git commit -m "Description of changes"
```

**Commit Message Guidelines:**
- Use present tense ("Add feature" not "Added feature")
- Be descriptive but concise
- Reference issues if applicable

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Code Style

### TypeScript/JavaScript

- Use TypeScript for SDK code
- Follow ESLint configuration
- Use async/await for asynchronous operations
- Add JSDoc comments for public APIs

### Circom

- Follow Circom 2.1.0 syntax
- Add comments explaining complex constraints
- Use descriptive signal names
- Document public/private input requirements

## Testing Guidelines

### Unit Tests

- Write tests for all new functions
- Test edge cases and error conditions
- Aim for >80% code coverage

### Integration Tests

- Test complete flows (deposit → trade → withdraw)
- Verify cryptographic consistency
- Test error handling

### Circuit Tests

- Test all constraint paths
- Include negative test cases (should fail)
- Test edge cases (zero values, max values)

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document circuit constraints
- Explain cryptographic design decisions

### README Updates

- Update README when adding features
- Include usage examples
- Document breaking changes

## Security Considerations

⚠️ **Important:** This is a cryptographic protocol. Security is critical.

### Before Submitting

- Review cryptographic implementations carefully
- Ensure no secrets are logged or exposed
- Verify nullifier uniqueness
- Check Merkle tree consistency
- Validate all input ranges

### Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security@ProofSight.fun
3. Include detailed description and steps to reproduce

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests
5. **Update** documentation
6. **Ensure** all tests pass
7. **Submit** pull request

### PR Requirements

- All tests must pass
- Code must be linted
- Documentation updated
- No security vulnerabilities
- Clear description of changes

## Areas for Contribution

### High Priority

- Circuit optimizations (reduce constraint count)
- Additional test coverage
- Documentation improvements
- Performance benchmarking
- Security audits

### Medium Priority

- Solana program implementation
- CLI tool improvements
- Example applications
- Integration tests
- Error handling improvements

### Low Priority

- UI components
- Developer tools
- Monitoring infrastructure
- Local development environment

## Questions?

- Open an issue for questions
- Check existing documentation
- Review code comments

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

