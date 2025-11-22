# ProofSight Research

Mathematical foundations, security analysis, and formal specifications for the ProofSight privacy-preserving prediction market protocol.

## Overview

This repository contains the theoretical foundations and security analysis for ProofSight, a privacy-preserving prediction market protocol built on Solana using zero-knowledge proofs.

## Contents

- **[Privacy Guarantees](./proofs/privacy_guarantees.md)** - Formal privacy proofs and anonymity analysis
- **[Unlinkability Theorem](./proofs/unlinkability_theorem.md)** - Statistical unlinkability guarantees
- **[AMM Correctness](./proofs/amm_correctness.md)** - Price discovery correctness proofs
- **[Threat Model](./security/threat_model.md)** - Comprehensive threat model
- **[Attack Vectors](./security/attack_vectors.md)** - Known attack vectors and mitigations
- **[Circuit Specifications](./specs/circuit_specs.md)** - Formal circuit specifications
- **[Privacy Analysis](./benchmarks/privacy_analysis.md)** - Anonymity set evolution analysis

## Key Results

### Privacy Guarantees

With anonymity set size `k` and synthetic activity ratio `ρ`, the probability of correctly linking a deposit to withdrawal is:

```
P_link ≤ 1/(k · (1 + ρ)) + ε_time + ε_amount
```

where:
- `ε_time < 2⁻⁴⁰` with temporal mixing
- `ε_amount < 2⁻²⁰` with denomination enforcement

### Anonymity Set Evolution

The protocol ensures privacy from user #1 through synthetic activity generation, eliminating the bootstrapping paradox that plagues other privacy systems.

## References

See [references/](./references/) for academic papers and citations.

## Contributing

This is a research repository. Contributions should focus on:
- Mathematical proofs and formal analysis
- Security analysis and threat modeling
- Performance and privacy trade-off analysis

## License

MIT License - See [LICENSE](./LICENSE) file for details.

