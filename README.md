
# ProofSight
![ProofSight banner](public/banner.jpg)

# ProofSight Protocol

> **Privacy-Preserving Prediction Market Infrastructure on Solana**

ProofSight is a protocol for private prediction markets, enabling institutional capital to participate in price discovery without revealing positions or strategies. It utilizes **Groth16 Zero-Knowledge Proofs** and **Light Protocol's ZK Compression** to achieve privacy and scalability on Solana.

## Repository Structure

This monorepo contains the core components of the ProofSight protocol:

### 1. [Circuits](./circuits) (`/circuits`)
**Status: Pre-Alpha Logic**
Core Zero-Knowledge constraints implemented in Circom.
- **Deposit Circuit**: Shielded pool deposits with Merkle tree insertion.
- **Position Update**: AMM invariant ($x \cdot y = k$) checks and balance enforcement.
- **Withdrawal**: Nullifier generation and Merkle inclusion proofs.

### 2. [SDK](./sdk) (`/sdk`)
**Status: Pre-Alpha Implementation**
TypeScript SDK for client-side interaction.
- **Cryptography**: Real Pedersen commitments and Poseidon hashing using circomlibjs (Baby JubJub).
- **State Management**: Sparse Merkle Tree implementation with Poseidon hashing.
- **Proof Generation**: Integration with snarkjs for Groth16 proof generation.
- **API**: Complete deposit, trade, and withdraw flow implementation.

### 3. [Research](./research) (`/research`)
**Status: Validated**
Formal proofs and empirical simulations.
- **Privacy Guarantees**: Formal bounds on linkability ($P_{link} \le \frac{1}{k(1+\rho)} + \epsilon$).
- **Simulations**: Executable Python Monte Carlo simulations validating the privacy theorem.
- **Threat Model**: Comprehensive security analysis.

## Architecture

ProofSight separates **public price discovery** from **private position management**:

1.  **Shielded Pool**: Users deposit funds into a unified anonymity set.
2.  **Private Trading**: Trades are executed via ZK proofs that verify the AMM invariant without revealing the trade size or direction.
3.  **Temporal Mixing**: Batched processing breaks timing correlation.

## Getting Started

### Prerequisites
- Node.js 18+
- Rust / Cargo (for Solana programs)
- Python 3.10+ (for research simulations)

### Installation

```bash
# Install SDK dependencies
cd sdk && npm install

# Install Circuit dependencies
cd ../circuits && npm install
```

### Development

```bash
# Run SDK tests
cd sdk && npm test

# Run Circuit tests
cd circuits && npm test

# Build circuits
cd circuits && npm run build

# Generate proofs
cd circuits && npm run generate-proofs

# Benchmark performance
cd circuits && npm run benchmark
```

### Testing

The repository includes comprehensive test coverage:
- **Circuit Tests**: Deposit, position update, and withdrawal circuit validation
- **SDK Tests**: Cryptographic primitives, Merkle tree, and SDK integration
- **Integration Tests**: End-to-end protocol flows
- **Edge Case Tests**: Boundary conditions and error handling

All tests run automatically via GitHub Actions on push and pull requests.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed development guidelines.

## Documentation

- **[Circuits README](./circuits/README.md)**: Detailed circuit specifications and constraints
- **[SDK README](./sdk/README.md)**: Complete API reference and usage examples
- **[Contributing Guide](./CONTRIBUTING.md)**: Development setup and contribution guidelines

## Security

⚠️ **This codebase is in Pre-Alpha.**
- Circuits have not been audited.
- Trusted setup has not been performed.
- Do not use in production environments.

## License

MIT License


