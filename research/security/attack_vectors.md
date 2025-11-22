<img width="1366" height="721" alt="image" src="https://github.com/user-attachments/assets/d14d3777-5796-42fe-b375-b501eaa4fb8c" />
# Attack Vectors and Mitigations

## Overview

This document catalogs known attack vectors against ProofSight and the mitigations in place.

## 1. Timing Correlation Attacks

### Attack Description

An adversary observes:
- Deposit time `t_d`
- Withdrawal time `t_w`
- Attempts to link via `t_w - t_d`

### Mitigation

**Temporal Mixing**: All operations are batched with randomized delays of 1-24 hours. This breaks timing correlation.

**Effectiveness**: Reduces timing linkability to `ε_time < 2⁻⁴⁰`.

## 2. Amount Correlation Attacks

### Attack Description

An adversary observes:
- Deposit amount `a_d`
- Withdrawal amount `a_w`
- Attempts to link via `a_w ≤ a_d`

### Mitigation

**Denomination Enforcement**: Amounts are restricted to multiples of 0.1 SOL, creating equivalence classes.

**Effectiveness**: Reduces amount linkability to `ε_amount < 2⁻²⁰`.

## 3. Front-Running Attacks

### Attack Description

An adversary observes a profitable trade and attempts to front-run it.

### Mitigation

**Private Positions**: All positions are private until execution. Adversaries cannot see pending trades.

**Batch Processing**: Trades are executed in batches, preventing immediate front-running.

**Effectiveness**: Front-running is prevented for private positions.

## 4. Sybil Attacks

### Attack Description

An adversary creates many fake identities to reduce anonymity set or manipulate markets.

### Mitigation

**Economic Costs**: Each deposit requires SOL, making Sybil attacks expensive.

**Synthetic Activity**: Protocol-generated cover traffic maintains privacy even with Sybil attacks.

**Effectiveness**: Sybil attacks are economically infeasible at scale.

## 5. Double-Spending Attacks

### Attack Description

An adversary attempts to withdraw the same funds twice.

### Mitigation

**Nullifiers**: Each withdrawal reveals a unique nullifier. Attempting to reuse a nullifier is detected and rejected.

**Effectiveness**: Double-spending is cryptographically prevented.

## 6. Circuit Constraint Violations

### Attack Description

An adversary attempts to generate invalid proofs that pass verification.

### Mitigation

**Formal Verification**: Circuits are formally verified to ensure all constraints are correct.

**Test Vectors**: Comprehensive test vectors verify circuit correctness.

**Effectiveness**: Constraint violations are prevented by circuit design.

## 7. Merkle Tree Attacks

### Attack Description

An adversary attempts to:
- Prove inclusion of non-existent leaf
- Prove exclusion incorrectly
- Generate invalid Merkle paths

### Mitigation

**Sparse Merkle Tree**: Uses Sparse Merkle Tree with proper null leaf handling.

**Path Verification**: All Merkle paths are verified in circuits.

**Effectiveness**: Merkle tree attacks are prevented by cryptographic verification.

## 8. Commitment Binding Failures

### Attack Description

An adversary attempts to open a commitment to a different value.

### Mitigation

**Pedersen Commitments**: Use well-vetted Pedersen commitment scheme on Baby JubJub curve.

**Binding Property**: Cryptographically guaranteed binding property.

**Effectiveness**: Binding failures are computationally infeasible.

## 9. Market Manipulation

### Attack Description

An adversary attempts to manipulate market prices through coordinated trading.

### Mitigation

**Private Positions**: Makes coordination difficult.

**Liquidity Requirements**: Sufficient liquidity prevents manipulation.

**Future**: Market surveillance system (see whitepaper).

**Effectiveness**: Manipulation is difficult but not impossible (ongoing research).

## 10. DoS Attacks

### Attack Description

An adversary attempts to disrupt protocol operation through:
- Spam transactions
- Resource exhaustion
- Network attacks

### Mitigation

**Economic Costs**: Transactions require fees.

**Rate Limiting**: Per-user rate limits.

**Circuit Efficiency**: Efficient circuits prevent resource exhaustion.

**Effectiveness**: DoS attacks are economically infeasible.

## 11. Key Leakage

### Attack Description

An adversary gains access to a user's private keys.

### Mitigation

**Hardware Wallets**: Support for hardware wallet integration.

**Key Management**: Best practices documentation.

**User Education**: Security guides.

**Effectiveness**: Depends on user practices.

## 12. Oracle Manipulation

### Attack Description

An adversary attempts to manipulate oracle data to resolve markets incorrectly.

### Mitigation

**Multiple Oracles**: Use multiple independent oracles.

**Dispute Resolution**: Recursive SNARK-based dispute resolution.

**Economic Stakes**: Oracles have economic incentives to be honest.

**Effectiveness**: Oracle manipulation is difficult and costly.

## Summary

| Attack Vector | Severity | Mitigation | Status |
|--------------|----------|------------|--------|
| Timing Correlation | Medium | Temporal Mixing | ✅ Mitigated |
| Amount Correlation | Medium | Denomination Enforcement | ✅ Mitigated |
| Front-Running | High | Private Positions | ✅ Mitigated |
| Sybil | Low | Economic Costs | ✅ Mitigated |
| Double-Spending | High | Nullifiers | ✅ Mitigated |
| Circuit Violations | High | Formal Verification | ✅ Mitigated |
| Merkle Tree | Medium | Sparse Merkle Tree | ✅ Mitigated |
| Commitment Binding | High | Pedersen Commitments | ✅ Mitigated |
| Market Manipulation | Medium | Private Positions | ⚠️ Partial |
| DoS | Low | Economic Costs | ✅ Mitigated |
| Key Leakage | High | Hardware Wallets | ⚠️ User-Dependent |
| Oracle Manipulation | High | Multiple Oracles | ✅ Mitigated |

## References

- [Threat Model](./threat_model.md) - Comprehensive threat analysis
- [Privacy Guarantees](../proofs/privacy_guarantees.md) - Formal privacy proofs

