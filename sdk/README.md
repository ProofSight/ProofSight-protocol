# ProofSight SDK

TypeScript SDK for interacting with the ProofSight protocol on Solana.

## Installation

```bash
npm install @proofsight/sdk
```

## Quick Start

```typescript
import { ProofSightSDK } from '@proofsight/sdk';
import { Connection, Wallet } from '@solana/web3.js';

// Initialize SDK
const sdk = new ProofSightSDK({
  connection: new Connection('https://api.devnet.solana.com'),
  wallet: wallet,
  network: 'devnet',
});

// Initialize
await sdk.initialize();

// Deposit funds
const depositResult = await sdk.deposit(1000);
console.log('Deposit commitment:', depositResult.commitment);

// Create a market
const market = await sdk.createMarket({
  question: 'Will it rain tomorrow?',
  outcomes: ['Yes', 'No'],
  resolutionDate: new Date('2025-12-31'),
  initialLiquidity: 10000,
});

// Create a position
const position = await sdk.createPosition({
  marketId: market.id,
  outcome: 'Yes',
  amount: 500,
});

// Withdraw funds
const withdrawResult = await sdk.withdraw({
  amount: 1000,
  recipient: wallet.publicKey,
});
```

## API Reference

### ProofSightSDK

Main SDK class for protocol interaction.

#### Constructor

```typescript
new ProofSightSDK(options: ProofSightSDKOptions)
```

**Options:**
- `connection`: Solana Connection instance
- `wallet`: Wallet instance
- `network`: Network identifier ('mainnet-beta' | 'devnet' | 'testnet' | 'localnet')
- `proofConfig?`: Optional proof generation configuration

#### Methods

##### `initialize(): Promise<void>`

Initialize the SDK and load initial state.

##### `deposit(amount: number): Promise<DepositResult>`

Deposit funds into the shielded pool.

**Returns:**
- `amount`: Deposit amount
- `commitment`: Commitment hash
- `signature`: Transaction signature

##### `createMarket(options: CreateMarketOptions): Promise<Market>`

Create a new prediction market.

**Options:**
- `question`: Market question
- `outcomes`: Possible outcomes
- `resolutionDate`: Resolution date
- `initialLiquidity`: Initial liquidity in SOL
- `description?`: Optional description
- `category?`: Optional category

##### `createPosition(options: CreatePositionOptions): Promise<Position>`

Create a private position (trade).

**Options:**
- `marketId`: Market ID
- `outcome`: Outcome to bet on
- `amount`: Amount in SOL

##### `withdraw(options: WithdrawOptions): Promise<WithdrawResult>`

Withdraw funds from the shielded pool.

**Options:**
- `amount`: Amount to withdraw
- `recipient`: Recipient PublicKey

**Returns:**
- `amount`: Withdrawn amount
- `signature`: Transaction signature
- `nullifier`: Nullifier hash (prevents double-spending)

##### `getMarkets(options?: GetMarketsOptions): Promise<Market[]>`

Get markets matching the query.

##### `getPositions(options?: GetPositionsOptions): Promise<Position[]>`

Get user's positions.

##### `onMarketUpdate(marketId: string, callback: Function): () => void`

Subscribe to market updates. Returns unsubscribe function.

## Cryptographic Utilities

### CryptoUtils

Low-level cryptographic operations.

#### `generateSecret(): string`

Generate a cryptographically secure random secret (64-character hex string).

#### `poseidonHash(inputs: (number | BN | string)[]): Promise<string>`

Compute Poseidon hash of inputs.

#### `pedersenCommitment(value: number | BN, randomness: string): Promise<string>`

Compute Pedersen commitment on Baby JubJub curve.

#### `computeCommitment(amount: number, secret: string, index: number): Promise<string>`

Compute commitment for a deposit note: `Poseidon(amount, secret, index)`.

#### `computeNullifier(secret: string, commitment: string): Promise<string>`

Compute nullifier: `Poseidon(secret, commitment)`.

## Merkle Tree

### MerkleTree

Sparse Merkle tree implementation for witness generation.

#### Constructor

```typescript
new MerkleTree(levels: number = 32)
```

#### Methods

##### `insert(index: number, commitment: string): Promise<void>`

Insert a commitment into the tree.

##### `generatePath(index: number): Promise<{pathElements: string[], pathIndices: number[]}>`

Generate Merkle path for a given index.

##### `verifyPath(leaf: string, pathElements: string[], pathIndices: number[], root: string): Promise<boolean>`

Verify a Merkle path.

##### `getRoot(): Promise<string>`

Get current Merkle root.

## Proof Generation

### ProofGenerator

Utilities for generating and verifying ZK proofs.

#### `generateProof(wasmPath: string, zkeyPath: string, inputs: ProofInputs): Promise<ProofResult>`

Generate a Groth16 proof.

#### `verifyProof(vkeyPath: string, publicSignals: string[], proof: Proof): Promise<boolean>`

Verify a Groth16 proof.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Lint
npm run lint
```

## Testing

The SDK includes comprehensive tests:

- **crypto.test.ts**: Cryptographic primitive tests
- **merkle.test.ts**: Merkle tree tests
- **sdk.test.ts**: SDK integration tests
- **integration.test.ts**: End-to-end flow tests
- **edge-cases.test.ts**: Boundary condition tests

## Security

⚠️ **Pre-Alpha Status:**
- SDK has not been audited
- Do not use in production

**Cryptographic Implementation:**
- Uses `circomlibjs` for real cryptographic operations
- All operations are async (required for WASM)
- Proper secret generation using `crypto.getRandomValues`

## Dependencies

- `@solana/web3.js`: Solana blockchain interaction
- `circomlibjs`: Zero-knowledge cryptographic primitives
- `snarkjs`: Proof generation and verification
- `bn.js`: Big number arithmetic

## License

MIT License
