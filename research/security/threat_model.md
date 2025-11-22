<img width="1366" height="721" alt="image" src="https://github.com/user-attachments/assets/47dce236-8454-4408-8dae-ef505c5d60b0" />
# Threat Model

## Overview

This document defines the threat model for ProofSight, including adversary capabilities, attack surfaces, and security assumptions.

## Adversary Types

### 1. Passive Adversary (Eavesdropper)

**Capabilities**:
- Observes all public blockchain data
- Can analyze transaction patterns
- Can attempt timing/amount correlation
- Cannot modify transactions
- Cannot observe private inputs

**Goals**:
- Link deposits to withdrawals
- Identify user positions
- Infer trading strategies

**Mitigations**:
- Zero-knowledge proofs hide private inputs
- Temporal mixing breaks timing correlation
- Synthetic activity provides cover traffic
- Denomination enforcement breaks amount correlation

### 2. Active Adversary (Attacker)

**Capabilities**:
- All passive adversary capabilities
- Can submit transactions
- Can attempt front-running
- Can attempt DoS attacks
- Cannot break cryptographic primitives

**Goals**:
- Front-run profitable trades
- Disrupt protocol operation
- Extract value from other users

**Mitigations**:
- Private positions prevent front-running
- Batch processing prevents immediate execution
- Economic incentives discourage attacks
- Circuit constraints prevent invalid state transitions

### 3. Malicious Validator

**Capabilities**:
- Can reorder transactions within blocks
- Can censor transactions
- Cannot break cryptographic proofs
- Cannot forge valid proofs

**Goals**:
- Censor specific users
- Extract MEV through reordering

**Mitigations**:
- ZK proofs are validator-independent
- Multiple validators reduce censorship risk
- Economic penalties for censorship
- Decentralized validator set

### 4. Colluding Users

**Capabilities**:
- Multiple users coordinate
- Can share private information
- Can attempt Sybil attacks

**Goals**:
- Reduce anonymity set
- Identify other users
- Manipulate market prices

**Mitigations**:
- Synthetic activity maintains privacy even with collusion
- Economic costs prevent Sybil attacks
- Market manipulation detection (future work)

## Attack Surfaces

### 1. Cryptographic Primitives

**Attacks**:
- Hash function collisions
- Commitment scheme binding failures
- ZK proof soundness failures

**Assumptions**:
- SHA-256 is collision-resistant
- Pedersen commitments are binding
- Groth16 proofs are sound

**Mitigations**:
- Use well-vetted cryptographic primitives
- Regular security audits
- Formal verification of circuits

### 2. Circuit Implementation

**Attacks**:
- Constraint errors
- Arithmetic overflow/underflow
- Logic bugs

**Mitigations**:
- Formal verification
- Comprehensive test vectors
- Multiple independent audits

### 3. Smart Contract

**Attacks**:
- Reentrancy
- Integer overflow
- Access control failures

**Mitigations**:
- Anchor framework safety features
- Comprehensive testing
- Security audits

### 4. Client-Side

**Attacks**:
- Malicious proof generation
- Key leakage
- Phishing

**Mitigations**:
- Open-source client libraries
- Hardware wallet support
- User education

## Security Assumptions

### Cryptographic Assumptions

1. **Discrete Logarithm Problem**: Hard on Baby JubJub curve
2. **Hash Function Security**: SHA-256 is collision-resistant
3. **ZK Proof Soundness**: Groth16 proofs are sound
4. **Random Oracle Model**: Hash functions behave as random oracles

### System Assumptions

1. **Honest Majority**: Majority of validators are honest
2. **Network Synchrony**: Messages arrive within known bounds
3. **Clock Synchrony**: Validators have synchronized clocks (within tolerance)

### Economic Assumptions

1. **Rational Actors**: Users act to maximize utility
2. **Sufficient Stakes**: Attack costs exceed potential gains
3. **Liquidity**: Sufficient liquidity for normal operation

## Privacy Guarantees

Given the threat model above, ProofSight provides:

1. **Deposit Privacy**: Deposits cannot be linked to specific users
2. **Position Privacy**: Trading positions are completely private
3. **Withdrawal Privacy**: Withdrawals cannot be linked to deposits
4. **Amount Privacy**: Exact amounts are hidden (within denomination classes)

## Limitations

### Known Limitations

1. **Traffic Analysis**: Advanced traffic analysis may reveal some information
2. **Timing Attacks**: Precise timing analysis may reduce anonymity
3. **Amount Correlation**: Very large or unique amounts may be linkable
4. **Metadata**: Blockchain metadata (gas prices, etc.) may leak information

### Future Mitigations

1. **Dandelion++**: For transaction propagation privacy
2. **Amount Mixing**: More sophisticated amount mixing
3. **Metadata Scrubbing**: Remove linkable metadata

## References

- [Attack Vectors](./attack_vectors.md) - Detailed attack analysis
- [Privacy Guarantees](../proofs/privacy_guarantees.md) - Formal privacy proofs

