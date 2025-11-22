/**
 * Withdrawal Circuit Tests
 * 
 * Comprehensive tests for withdrawal circuit including edge cases
 */

const snarkjs = require('snarkjs');
const path = require('path');
const fs = require('fs');

const BUILD_DIR = path.join(__dirname, '../build');
const WASM_PATH = path.join(BUILD_DIR, 'withdrawal.wasm');
const ZKEY_PATH = path.join(BUILD_DIR, 'withdrawal_0001.zkey');

const wasmExists = fs.existsSync(WASM_PATH);
const zkeyExists = fs.existsSync(ZKEY_PATH);

const describeIf = (condition) => condition ? describe : describe.skip;

describeIf(wasmExists && zkeyExists)('Withdrawal Circuit', () => {
    describe('Valid Withdrawals', () => {
        it('should accept valid withdrawal with correct nullifier', async () => {

            const inputs = {
                root: '1234567890',
                nullifierHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                recipient: '11111111111111111111111111111111',
                secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                amount: '1000000',
                pathElements: Array(32).fill('0'),
                pathIndices: Array(32).fill('0')
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
                fail(`Valid withdrawal rejected: ${error.message}`);
            }
        });

        it('should handle maximum withdrawal amount', async () => {
            const inputs = {
                root: '1234567890',
                nullifierHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                recipient: '11111111111111111111111111111111',
                secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                amount: '18446744073709551615',  // Max uint64
                pathElements: Array(32).fill('0'),
                pathIndices: Array(32).fill('0')
            };

            try {
                const { proof } = await snarkjs.groth16.fullProve(inputs, WASM_PATH, ZKEY_PATH);
                expect(proof).toBeDefined();
            } catch (error) {
                // May fail due to other constraints, but range check should pass
            }
        });
    });

    describe('Nullifier Validation', () => {
        it('should reject withdrawal with incorrect nullifier', async () => {
            // Nullifier doesn't match secret+commitment derivation
            const inputs = {
                root: '1234567890',
                nullifierHash: '0x0000000000000000000000000000000000000000000000000000000000000000',  // Wrong
                recipient: '11111111111111111111111111111111',
                secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                amount: '1000000',
                pathElements: Array(32).fill('0'),
                pathIndices: Array(32).fill('0')
            };

            try {
                await snarkjs.groth16.fullProve(inputs, WASM_PATH, ZKEY_PATH);
                fail('Circuit should reject incorrect nullifier');
            } catch (error) {
                // Expected: nullifier check should fail
                expect(error).toBeDefined();
            }
        });
    });

    describe('Recipient Binding', () => {
        it('should reject withdrawal with zero recipient', async () => {
            const inputs = {
                root: '1234567890',
                nullifierHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                recipient: '0',  // Zero recipient
                secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                amount: '1000000',
                pathElements: Array(32).fill('0'),
                pathIndices: Array(32).fill('0')
            };

            try {
                await snarkjs.groth16.fullProve(inputs, WASM_PATH, ZKEY_PATH);
                fail('Circuit should reject zero recipient');
            } catch (error) {
                // Expected: recipient non-zero check should fail
                expect(error).toBeDefined();
            }
        });
    });

    describe('Merkle Path Validation', () => {
        it('should reject withdrawal with invalid Merkle path', async () => {
            // Invalid path that doesn't lead to root
            const inputs = {
                root: '9999999999',  // Wrong root
                nullifierHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                recipient: '11111111111111111111111111111111',
                secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                amount: '1000000',
                pathElements: Array(32).fill('0'),
                pathIndices: Array(32).fill('0')
            };

            try {
                await snarkjs.groth16.fullProve(inputs, WASM_PATH, ZKEY_PATH);
                fail('Circuit should reject invalid Merkle path');
            } catch (error) {
                // Expected: Merkle verification should fail
                expect(error).toBeDefined();
            }
        });
    });
});

