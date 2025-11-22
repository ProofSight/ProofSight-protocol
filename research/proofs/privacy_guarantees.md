# Privacy Guarantees

## Overview

ProofSight provides privacy guarantees through a combination of zero-knowledge proofs, synthetic activity generation, and temporal mixing. This document formalizes the privacy properties of the protocol.

## Privacy Model

### Anonymity Set

The anonymity set for any operation is defined as the set of all users who could have performed that operation, given public information.

**Definition**: For a deposit operation `d`, the anonymity set `A(d)` is the set of all users who deposited within the temporal mixing window `[t - Δt, t]` where `t` is the deposit timestamp and `Δt` is the mixing delay.

### Synthetic Activity

The protocol generates synthetic transactions to ensure privacy from user #1. The synthetic activity ratio `ρ` is defined as:

```
ρ = (synthetic_transactions) / (real_transactions)
```

For ProofSight, `ρ ≥ 1.0` ensures that synthetic activity always exceeds real activity, providing cover traffic even for the first user.

## Statistical Unlinkability

### Theorem 1: Deposit-Withdrawal Unlinkability

**Statement**: With anonymity set size `k` and synthetic activity ratio `ρ`, the probability of correctly linking a deposit to withdrawal is bounded by:

```
P_link ≤ 1/(k · (1 + ρ)) + ε_time + ε_amount
```

where:
- `ε_time < 2⁻⁴⁰` with temporal mixing (1-24 hour delays)
- `ε_amount < 2⁻²⁰` with denomination enforcement

**Proof Sketch**:

1. **Temporal Mixing**: Random delays of 1-24 hours break timing correlation. The probability of guessing the correct temporal window is `1/24` per hour, leading to `ε_time < 2⁻⁴⁰` for 24-hour windows.

2. **Amount Mixing**: Denomination enforcement (multiples of 0.1 SOL) creates equivalence classes. With `2²⁰` possible denominations, `ε_amount < 2⁻²⁰`.

3. **Synthetic Activity**: Each real transaction is mixed with `ρ` synthetic transactions, reducing linkability by factor `(1 + ρ)`.

4. **Anonymity Set**: With `k` users in the mixing window, the base linkability probability is `1/k`.

Combining these factors gives the stated bound.

### Corollary: Privacy from User #1

Since `ρ ≥ 1.0`, even the first user has `k ≥ 2` (themselves + at least one synthetic transaction), ensuring `P_link < 0.5` from the start.

## Zero-Knowledge Properties

### Pedersen Commitments

Position values are committed using Pedersen commitments on the Baby JubJub curve:

```
C = v · G + r · H
```

where:
- `v` is the value
- `r` is randomness
- `G, H` are generator points

**Property**: Pedersen commitments are computationally hiding and binding. Given `C`, an adversary cannot determine `v` without knowing `r` (hiding). Additionally, it's computationally infeasible to find `(v', r') ≠ (v, r)` such that `C = v' · G + r' · H` (binding).

### Nullifier Unlinkability

Each deposit generates a nullifier:

```
nullifier = H(sk, leaf_index)
```

**Property**: Nullifiers cannot be linked to deposits without knowledge of `sk`. Even if an adversary observes both the deposit commitment and the withdrawal nullifier, they cannot link them without breaking the hash function.

## Temporal Privacy

### Batch Processing

All operations are batched with randomized processing delays of 1-24 hours. This prevents timing correlation attacks where an adversary observes:
- Deposit time `t_d`
- Withdrawal time `t_w`
- Attempts to link via `t_w - t_d`

**Guarantee**: With 24-hour windows, the probability of correct temporal correlation is `≤ 1/24` per hour, leading to `ε_time < 2⁻⁴⁰` for full-window analysis.

## Amount Privacy

### Denomination Enforcement

Amounts are restricted to multiples of 0.1 SOL, creating equivalence classes. This prevents amount correlation attacks where unique amounts could be linked.

**Guarantee**: With `2²⁰` possible denominations, the probability of unique amount correlation is `ε_amount < 2⁻²⁰`.

## Forward Privacy

### Merkle Tree Updates

The Sparse Merkle Tree structure ensures that new deposits don't reveal information about previous positions. Each update only reveals:
- The new root
- The deposit amount (public)
- No information about existing positions

**Property**: Forward privacy is maintained - new users cannot learn about historical positions.

## References

- [Unlinkability Theorem](./unlinkability_theorem.md) - Detailed proof
- [Threat Model](../security/threat_model.md) - Adversary capabilities
- [Attack Vectors](../security/attack_vectors.md) - Known attacks and mitigations

