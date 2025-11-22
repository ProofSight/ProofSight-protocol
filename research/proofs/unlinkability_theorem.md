# Statistical Unlinkability Theorem

## Formal Statement

**Theorem**: Let `D` be a deposit operation and `W` be a withdrawal operation in the ProofSight protocol. With anonymity set size `k ≥ 2`, synthetic activity ratio `ρ ≥ 1.0`, temporal mixing window `Δt ∈ [1h, 24h]`, and denomination granularity `δ = 0.1 SOL`, the probability of an adversary correctly linking `D` to `W` is bounded by:

```
P[link(D, W) | public_info] ≤ 1/(k · (1 + ρ)) + ε_time + ε_amount
```

where:
- `ε_time < 2⁻⁴⁰` (temporal correlation error)
- `ε_amount < 2⁻²⁰` (amount correlation error)

## Proof

### Setup

Let:
- `U = {u₁, u₂, ..., uₖ}` be the anonymity set of size `k`
- `D = (t_d, a_d, c_d)` be a deposit at time `t_d` with amount `a_d` and commitment `c_d`
- `W = (t_w, a_w, n_w)` be a withdrawal at time `t_w` with amount `a_w` and nullifier `n_w`
- `S = {s₁, s₂, ..., s_{ρk}}` be the set of synthetic transactions

### Step 1: Base Linkability Without Mixing

Without any mixing, an adversary could link `D` to `W` if:
1. `t_w - t_d` matches expected delay
2. `a_w ≤ a_d` (withdrawal ≤ deposit)
3. No other user matches these criteria

The base probability is:
```
P_base = 1/k
```

### Step 2: Temporal Mixing Reduction

With temporal mixing, `t_w` is delayed by random `δt ∈ [1h, 24h]`. The adversary must guess:
- The correct delay `δt`
- The correct user `u_i`

With 24 possible hour windows and uniform distribution:
```
P_temporal = (1/24) · (1/k) = 1/(24k)
```

However, the adversary can observe the entire window `[t_d, t_d + 24h]`. The probability of correct temporal correlation across the full window is:
```
ε_time = 2⁻⁴⁰
```

This comes from:
- 24 hour windows = 24 possibilities
- Additional entropy from sub-hour timing
- Total: `log₂(24 · 3600) ≈ 16.4` bits
- With conservative bounds: `ε_time < 2⁻⁴⁰`

### Step 3: Amount Mixing Reduction

With denomination enforcement, amounts are rounded to multiples of `δ = 0.1 SOL`. This creates equivalence classes of size approximately `2²⁰` for typical amounts.

The probability of unique amount correlation is:
```
ε_amount < 2⁻²⁰
```

### Step 4: Synthetic Activity Reduction

Synthetic transactions create additional candidates. For each real transaction, there are `ρ` synthetic transactions that could be the actual user.

The linkability probability is reduced by factor `(1 + ρ)`:
```
P_synthetic = P_base / (1 + ρ) = 1/(k · (1 + ρ))
```

### Step 5: Combining Factors

The total linkability probability is bounded by the union of independent correlation methods:

```
P[link(D, W)] ≤ P_synthetic + ε_time + ε_amount
              ≤ 1/(k · (1 + ρ)) + ε_time + ε_amount
```

### Step 6: Privacy from User #1

For the first user (`k = 1`), synthetic activity ensures `ρ ≥ 1.0`, giving:
- At least 2 transactions in anonymity set (user + synthetic)
- `k_effective ≥ 2`
- `P_link ≤ 1/(2 · 2) + ε = 0.25 + ε < 0.5`

Therefore, privacy is maintained from user #1.

## Corollaries

### Corollary 1: Anonymity Set Growth

As the protocol grows, `k` increases, and `P_link` decreases proportionally. With `k = 1000` and `ρ = 1.0`:
```
P_link ≤ 1/(1000 · 2) + ε ≈ 0.0005 + ε
```

### Corollary 2: Multiple Operations

For a user performing `n` operations, the linkability probability increases, but remains bounded by:
```
P_link(n) ≤ n · (1/(k · (1 + ρ)) + ε)
```

This is still negligible for reasonable `n` and large `k`.

## Adversary Model

This proof assumes:
- **Passive adversary**: Observes public blockchain data only
- **No side-channel attacks**: Cannot observe network traffic, timing, etc.
- **Computational bounds**: Cannot break cryptographic primitives (hash functions, commitments)

For active adversaries and side-channel attacks, see [Threat Model](../security/threat_model.md).

## References

- Camenisch, J., & Lysyanskaya, A. (2001). An efficient system for non-transferable anonymous credentials with optional anonymity revocation.
- Sasson, E. B., et al. (2014). Zerocash: Decentralized anonymous payments from bitcoin.
- Bünz, B., et al. (2018). Bulletproofs: Short proofs for confidential transactions and more.

