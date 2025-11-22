# ProofSight Simulations

## Privacy Simulation

This simulation empirically validates the unlinkability theorem described in the whitepaper. It models:
1. Anonymity set evolution
2. Temporal mixing delays
3. Synthetic activity generation

To run:
```bash
python3 simulations/privacy.py
```

## Results

The simulation demonstrates that for `k > 100` and `rho >= 1.0`, the linkability probability drops below 1%, validating the protocol's privacy guarantees.

