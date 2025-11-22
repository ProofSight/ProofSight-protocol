# ProofSight Circuits

Zero-knowledge proof circuits for ProofSight protocol, implemented in Circom 2.1.0.

## Overview

ProofSight uses three primary circuits:

1. **Deposit Circuit** - Handles shielded pool deposits with Merkle tree insertion
2. **Position Update Circuit** - Manages private position updates with AMM invariant checks
3. **Withdrawal Circuit** - Processes withdrawals with nullifier proofs

## Circuit Specifications

### Deposit Circuit (`deposit.circom`)

**Public Inputs:**
- `deposit_amount`: Amount being deposited (64-bit)
- `new_root`: New Merkle root after insertion
- `timestamp`: Unix timestamp for temporal mixing

**Private Inputs:**
- `secret`: User's private secret (field element)
- `nullifier_key`: Derived from secret
- `old_root`: Previous Merkle root
- `pathElements[32]`: Merkle path sibling hashes
- `pathIndices[32]`: Merkle path directions (0/1)

**Constraints:**
1. Amount range check: `0 <= deposit_amount < 2^64`
2. Nullifier derivation: `nullifier = Poseidon(secret, commitment)`
3. Commitment generation: `commitment = Poseidon(amount, secret, index)`
4. Merkle tree insertion verification
5. Timestamp validation (64-bit format)

**Security Properties:**
- Nullifier is cryptographically bound to secret + commitment (not pathIndices)
- Prevents double-spending through nullifier uniqueness
- Temporal mixing enforced via timestamp constraints

### Position Update Circuit (`position_update.circom`)

**Public Inputs:**
- `market_id`: Market identifier
- `pool_token_a`: Current pool reserves for Token A
- `pool_token_b`: Current pool reserves for Token B
- `new_pool_token_a`: New pool reserves for Token A
- `new_pool_token_b`: New pool reserves for Token B

**Private Inputs:**
- `amount_in`: Amount of tokens being traded
- `is_buy_a`: 1 if buying Token A, 0 if buying Token B
- `min_amount_out`: Minimum output amount (slippage protection)
- `user_secret`: Authorization secret
- `position_commitment`: Commitment to user's position

**Constraints:**
1. Range checks on all inputs (64-bit)
2. Constant Product Market Maker (CPMM) invariant: `k_new >= k_old`
3. Balance consistency: State transition follows swap formula
4. Slippage protection: `amount_out >= min_amount_out`
5. Authorization: Secret-based position verification
6. Pool safety: Pools cannot go to zero

**AMM Logic:**
- Buying A: `new_pool_b = pool_b + amount_in`, `new_pool_a = k_old / new_pool_b`
- Buying B: `new_pool_a = pool_a + amount_in`, `new_pool_b = k_old / new_pool_a`

### Withdrawal Circuit (`withdrawal.circom`)

**Public Inputs:**
- `root`: Current Merkle root
- `nullifierHash`: Unique nullifier for this note
- `recipient`: Address to receive funds

**Private Inputs:**
- `secret`: User's secret key
- `amount`: Amount in the note
- `pathElements[32]`: Merkle path sibling hashes
- `pathIndices[32]`: Merkle path directions

**Constraints:**
1. Commitment reconstruction: `commitment = Poseidon(amount, secret, index)`
2. Nullifier derivation: `nullifier = Poseidon(secret, commitment)`
3. Nullifier verification: Public nullifier matches computed nullifier
4. Merkle membership proof verification
5. Recipient binding: `boundNullifier = Poseidon(nullifier, recipient)`
6. Recipient non-zero check
7. Amount range check (64-bit)

**Security Properties:**
- Prevents double-spending via nullifier uniqueness
- Recipient binding prevents replay attacks
- Merkle proof ensures note exists in tree

## Building Circuits

```bash
# Install dependencies
npm install

# Compile all circuits
npm run build

# This generates:
# - build/deposit.wasm
# - build/deposit.r1cs
# - build/position_update.wasm
# - build/position_update.r1cs
# - build/withdrawal.wasm
# - build/withdrawal.r1cs
```

## Testing

```bash
# Run all circuit tests
npm test

# Run specific test file
npm test -- deposit.test.js
```

**Note:** Tests require compiled circuits. Run `npm run build` first.

## Proof Generation

```bash
# Generate test proofs
npm run generate-proofs

# This creates test vectors in test-vectors/
```

## Benchmarking

```bash
# Benchmark proof generation times
npm run benchmark

# Target: <3 seconds per proof generation
```

## Trusted Setup

For production use, a trusted setup ceremony must be performed to generate:
- Proving keys (`.zkey` files)
- Verification keys (`.vkey` files)

**Warning:** The current repository does not include trusted setup files. These must be generated through a secure ceremony before production deployment.

## Security Considerations

⚠️ **Pre-Alpha Status:**
- Circuits have not been audited
- Trusted setup has not been performed
- Do not use in production

**Known Limitations:**
- Temporal mixing bounds checking happens on-chain (not in circuit)
- Position update authorization is simplified (full Merkle check would be ideal)
- Some optimizations may be possible for constraint count

## Performance Targets

- Proof generation: <3 seconds
- Proof size: ~128 bytes (Groth16)
- Verification time: ~5ms on-chain

## Dependencies

- `circom@^2.1.8` - Circuit compiler
- `circomlib@^2.0.5` - Circuit library (Poseidon, Pedersen)
- `snarkjs@^0.7.0` - Proof generation and verification
- `jest@^29.7.0` - Testing framework

## References

- [Circom Documentation](https://docs.circom.io/)
- [Circomlib](https://github.com/iden3/circomlib)
- [SnarkJS](https://github.com/iden3/snarkjs)
