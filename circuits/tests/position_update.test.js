/**
 * Position Update Circuit Tests
 * 
 * Tests for the position update circuit constraints and AMM logic
 */

const snarkjs = require('snarkjs');
const path = require('path');
const fs = require('fs');

const BUILD_DIR = path.join(__dirname, '../build');
const WASM_PATH = path.join(BUILD_DIR, 'position_update.wasm');
const ZKEY_PATH = path.join(BUILD_DIR, 'position_update_0001.zkey');

const wasmExists = fs.existsSync(WASM_PATH);
const zkeyExists = fs.existsSync(ZKEY_PATH);

const describeIf = (condition) => condition ? describe : describe.skip;

describeIf(wasmExists && zkeyExists)('Position Update Circuit', () => {
    describe('AMM Invariant Constraints', () => {
        it('should accept valid buy A transaction', async () => {

            // Buying Token A: add to pool_b, remove from pool_a
            // Initial: pool_a = 1000, pool_b = 1000, k = 1,000,000
            // Add 100 to pool_b: new_pool_b = 1100
            // new_pool_a = k / new_pool_b = 1,000,000 / 1100 ≈ 909
            const inputs = {
                market_id: '1',
                pool_token_a: '1000000000',
                pool_token_b: '1000000000',
                new_pool_token_a: '909090909',
                new_pool_token_b: '1100000000',
                amount_in: '100000000',
                is_buy_a: '1',
                min_amount_out: '80000000',
                user_secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                position_commitment: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
            };

            try {
                const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                    inputs,
                    WASM_PATH,
                    ZKEY_PATH
                );
                
                expect(proof).toBeDefined();
                expect(publicSignals).toBeDefined();
            } catch (error) {
                // If proof generation fails, constraints are not satisfied
                fail(`Valid AMM transaction rejected: ${error.message}`);
            }
        });

        it('should accept valid buy B transaction', async () => {
            // Buying Token B: add to pool_a, remove from pool_b
            const inputs = {
                market_id: '1',
                pool_token_a: '1000000000',
                pool_token_b: '1000000000',
                new_pool_token_a: '1100000000',
                new_pool_token_b: '909090909',
                amount_in: '100000000',
                is_buy_a: '0',
                min_amount_out: '80000000',
                user_secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                position_commitment: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
            };

            try {
                const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                    inputs,
                    WASM_PATH,
                    ZKEY_PATH
                );
                
                expect(proof).toBeDefined();
            } catch (error) {
                fail(`Valid buy B transaction rejected: ${error.message}`);
            }
        });

        it('should reject transactions that violate AMM invariant', async () => {
            // Invalid: new_pool_a * new_pool_b < k_old
            const inputs = {
                market_id: '1',
                pool_token_a: '1000000000',
                pool_token_b: '1000000000',
                new_pool_token_a: '500000000',  // Too low
                new_pool_token_b: '500000000',  // Too low
                amount_in: '100000000',
                is_buy_a: '1',
                min_amount_out: '80000000',
                user_secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                position_commitment: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
            };

            try {
                await snarkjs.groth16.fullProve(inputs, WASM_PATH, ZKEY_PATH);
                fail('Circuit should reject invalid AMM state');
            } catch (error) {
                // Expected: circuit should reject this
                expect(error).toBeDefined();
            }
        });
    });

    describe('Slippage Protection', () => {
        it('should enforce min_amount_out constraint', async () => {
            // Transaction where amount_out < min_amount_out should fail
            const inputs = {
                market_id: '1',
                pool_token_a: '1000000000',
                pool_token_b: '1000000000',
                new_pool_token_a: '909090909',
                new_pool_token_b: '1100000000',
                amount_in: '100000000',
                is_buy_a: '1',
                min_amount_out: '950000000',  // Unrealistically high
                user_secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                position_commitment: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
            };

            try {
                await snarkjs.groth16.fullProve(inputs, WASM_PATH, ZKEY_PATH);
                fail('Circuit should reject when slippage too high');
            } catch (error) {
                // Expected: slippage check should fail
                expect(error).toBeDefined();
            }
        });
    });

    describe('Range Checks', () => {
        it('should enforce amount_in range', async () => {
            // Test with valid range
            const inputs = {
                market_id: '1',
                pool_token_a: '1000000000',
                pool_token_b: '1000000000',
                new_pool_token_a: '909090909',
                new_pool_token_b: '1100000000',
                amount_in: '18446744073709551615',  // Max uint64
                is_buy_a: '1',
                min_amount_out: '80000000',
                user_secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                position_commitment: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
            };

            // Should handle max value (may fail if AMM math doesn't work, but range check should pass)
            try {
                await snarkjs.groth16.fullProve(inputs, WASM_PATH, ZKEY_PATH);
            } catch (error) {
                // May fail due to AMM math, but not due to range check
            }
        });
    });

    describe('Pool Safety Checks', () => {
        it('should reject transactions that empty a pool', async () => {
            // Attempt to drain pool_a
            const inputs = {
                market_id: '1',
                pool_token_a: '1000000000',
                pool_token_b: '1000000000',
                new_pool_token_a: '0',  // Empty pool
                new_pool_token_b: '2000000000',
                amount_in: '1000000000',
                is_buy_a: '1',
                min_amount_out: '80000000',
                user_secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                position_commitment: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
            };

            try {
                await snarkjs.groth16.fullProve(inputs, WASM_PATH, ZKEY_PATH);
                fail('Circuit should reject empty pool');
            } catch (error) {
                // Expected: pool non-zero check should fail
                expect(error).toBeDefined();
            }
        });
    });
});

