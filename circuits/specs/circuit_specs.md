# Circuit Specifications

Formal specifications for ProofSight's zero-knowledge proof circuits.

## Deposit Circuit

### Public Inputs

- `deposit_amount`: `uint64` - Visible amount entering shielded pool
- `new_root`: `field` - Updated Merkle root after insertion
- `timestamp`: `uint64` - Block timestamp for temporal mixing

### Private Inputs

- `secret`: `field` - User's private randomness
- `nullifier`: `field` - Derived from secret: `H(sk, leaf_index)`
- `old_root`: `field` - Previous Merkle root
- `merkle_path`: `field[32]` - Merkle path witness (depth-32 tree)
- `leaf_index`: `uint32` - Position in Merkle tree

### Constraints

1. **Commitment Formation**: 
   ```
   C = H(deposit_amount, secret, nullifier, old_root, leaf_index)
   ```

2. **Merkle Path Validity**: 
   ```
   verify_merkle_path(old_root, new_root, C, merkle_path, leaf_index) == true
   ```

3. **Range Proof**: 
   ```
   0 < deposit_amount < 2^64
   ```

4. **Temporal Mixing**: 
   ```
   current_time - 6h ≤ timestamp ≤ current_time
   ```

### Output

- `commitment_out`: `field` - Computed commitment

## Position Update Circuit

### Public Inputs

- `market_id`: `field` - Market identifier
- `new_pool_state`: `field` - Encrypted aggregate pool state
- `price_impact`: `field` - Public price update

### Private Inputs

- `position_before`: `field` - Previous position commitment
- `position_after`: `field` - New position commitment
- `trade_amount`: `int64` - Trade size and direction (positive = buy, negative = sell)
- `secret_key`: `field` - User's secret key for authorization
- `balance_before`: `uint64` - Balance before trade
- `balance_after`: `uint64` - Balance after trade

### Constraints

1. **State Transition**: 
   ```
   position_after = position_before + H(trade_amount, market_id, timestamp)
   ```

2. **Balance Check**: 
   ```
   balance_after ≥ 0
   balance_after = balance_before - trade_amount (if buying) or balance_after = balance_before + trade_amount (if selling)
   ```

3. **Market Validity**: 
   ```
   market_id ∈ active_markets
   ```

4. **Price Calculation**: 
   ```
   price_impact = compute_amm_price(market_id, trade_amount, pool_state)
   ```

5. **Authorization**: 
   ```
   verify_signature(secret_key, hash(position_before, position_after, trade_amount)) == true
   ```

### Output

- `valid`: `bool` - Whether the update is valid

## Withdrawal Circuit

### Public Inputs

- `nullifier`: `field` - Nullifier to prevent double-spending
- `amount`: `uint64` - Withdrawal amount
- `recipient`: `field` - Destination address
- `merkle_root`: `field` - Current Merkle root

### Private Inputs

- `position`: `field` - Complete position state
- `merkle_path`: `field[32]` - Merkle path witness
- `secret`: `field` - User's secret (proves ownership)
- `position_balance`: `uint64` - Balance in position
- `leaf_index`: `uint32` - Position in Merkle tree

### Constraints

1. **Merkle Inclusion**: 
   ```
   verify_merkle_path(merkle_root, position, merkle_path, leaf_index) == true
   ```

2. **Nullifier Correctness**: 
   ```
   nullifier == H(secret, position, leaf_index)
   ```

3. **Amount Validity**: 
   ```
   amount ≤ position_balance
   ```

4. **Authorization**: 
   ```
   verify_signature(secret, hash(nullifier, amount, recipient)) == true
   ```

### Output

- `valid`: `bool` - Whether the withdrawal is valid

## Cryptographic Primitives

### Hash Function

All circuits use Poseidon hash function (from circomlib) for:
- Commitment generation
- Nullifier generation
- Merkle tree hashing

### Merkle Tree

- Type: Sparse Merkle Tree
- Depth: 32
- Capacity: 2^32 leaves
- Hash: Poseidon

### Curve

- Baby JubJub curve (Edwards form)
- Field: BN254 scalar field

## References

- [ProofSight Whitepaper](../../public/whitepaper.txt)
- [Research Repository](../ProofSight-research/)

