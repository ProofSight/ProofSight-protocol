/**
 * Edge Case Tests
 * 
 * Tests for boundary conditions, error cases, and edge scenarios
 */

import { CryptoUtils } from '../src/crypto';
import { MerkleTree } from '../src/merkle';

describe('Edge Cases', () => {
    describe('CryptoUtils Edge Cases', () => {
        it('should handle zero value commitments', async () => {
            const randomness = CryptoUtils.generateSecret();
            const commitment = await CryptoUtils.pedersenCommitment(0, randomness);
            expect(commitment).toBeDefined();
            expect(commitment).toMatch(/^0x[0-9a-f]+$/);
        });

        it('should handle maximum value commitments', async () => {
            const randomness = CryptoUtils.generateSecret();
            const maxValue = Number.MAX_SAFE_INTEGER;
            const commitment = await CryptoUtils.pedersenCommitment(maxValue, randomness);
            expect(commitment).toBeDefined();
        });

        it('should handle empty Poseidon hash inputs', async () => {
            const hash = await CryptoUtils.poseidonHash([]);
            expect(hash).toBeDefined();
        });

        it('should handle single input Poseidon hash', async () => {
            const hash = await CryptoUtils.poseidonHash([123]);
            expect(hash).toBeDefined();
            expect(hash).toMatch(/^0x[0-9a-f]+$/);
        });

        it('should handle large Poseidon hash inputs', async () => {
            const largeInputs = Array(10).fill(0).map((_, i) => i * 1000000);
            const hash = await CryptoUtils.poseidonHash(largeInputs);
            expect(hash).toBeDefined();
        });
    });

    describe('MerkleTree Edge Cases', () => {
        it('should handle empty tree', async () => {
            const tree = new MerkleTree(32);
            const root = await tree.getRoot();
            expect(root).toBeDefined();
        });

        it('should handle single leaf insertion', async () => {
            const tree = new MerkleTree(32);
            const commitment = await CryptoUtils.poseidonHash([1, 2, 3]);
            await tree.insert(0, commitment);
            
            const root = await tree.getRoot();
            expect(root).toBeDefined();
            
            const path = await tree.generatePath(0);
            const isValid = await tree.verifyPath(commitment, path.pathElements, path.pathIndices, root);
            expect(isValid).toBe(true);
        });

        it('should handle insertion at maximum index', async () => {
            const tree = new MerkleTree(32);
            const maxIndex = Math.pow(2, 32) - 1;
            const commitment = await CryptoUtils.poseidonHash([maxIndex]);
            
            // Note: This may be computationally expensive, but should work
            await tree.insert(maxIndex, commitment);
            
            const root = await tree.getRoot();
            expect(root).toBeDefined();
        });

        it('should handle consecutive insertions', async () => {
            const tree = new MerkleTree(32);
            const commitments: string[] = [];
            
            for (let i = 0; i < 10; i++) {
                const comm = await CryptoUtils.poseidonHash([i]);
                commitments.push(comm);
                await tree.insert(i, comm);
            }
            
            // Verify all paths
            const root = await tree.getRoot();
            for (let i = 0; i < 10; i++) {
                const path = await tree.generatePath(i);
                const isValid = await tree.verifyPath(
                    commitments[i],
                    path.pathElements,
                    path.pathIndices,
                    root
                );
                expect(isValid).toBe(true);
            }
        });

        it('should reject invalid path verification', async () => {
            const tree = new MerkleTree(32);
            const commitment = await CryptoUtils.poseidonHash([1]);
            await tree.insert(0, commitment);
            
            const root = await tree.getRoot();
            const path = await tree.generatePath(0);
            
            // Modify path element
            const invalidPath = [...path.pathElements];
            invalidPath[0] = await CryptoUtils.poseidonHash([999]);
            
            const isValid = await tree.verifyPath(commitment, invalidPath, path.pathIndices, root);
            expect(isValid).toBe(false);
        });

        it('should handle zero value commitments in tree', async () => {
            const tree = new MerkleTree(32);
            const zeroCommitment = await CryptoUtils.poseidonHash([0, 0]);
            await tree.insert(0, zeroCommitment);
            
            const root = await tree.getRoot();
            expect(root).toBeDefined();
        });
    });

    describe('Nullifier Edge Cases', () => {
        it('should generate unique nullifiers for same secret, different commitments', async () => {
            const secret = CryptoUtils.generateSecret();
            const comm1 = await CryptoUtils.computeCommitment(1000, secret, 0);
            const comm2 = await CryptoUtils.computeCommitment(2000, secret, 0);
            
            const null1 = await CryptoUtils.computeNullifier(secret, comm1);
            const null2 = await CryptoUtils.computeNullifier(secret, comm2);
            
            expect(null1).not.toBe(null2);
        });

        it('should generate unique nullifiers for different secrets, same commitment', async () => {
            const secret1 = CryptoUtils.generateSecret();
            const secret2 = CryptoUtils.generateSecret();
            const commitment = await CryptoUtils.computeCommitment(1000, secret1, 0);
            
            const null1 = await CryptoUtils.computeNullifier(secret1, commitment);
            const null2 = await CryptoUtils.computeNullifier(secret2, commitment);
            
            expect(null1).not.toBe(null2);
        });
    });

    describe('Commitment Edge Cases', () => {
        it('should handle zero amount commitments', async () => {
            const secret = CryptoUtils.generateSecret();
            const commitment = await CryptoUtils.computeCommitment(0, secret, 0);
            expect(commitment).toBeDefined();
        });

        it('should handle maximum amount commitments', async () => {
            const secret = CryptoUtils.generateSecret();
            const maxAmount = Number.MAX_SAFE_INTEGER;
            const commitment = await CryptoUtils.computeCommitment(maxAmount, secret, 0);
            expect(commitment).toBeDefined();
        });

        it('should generate different commitments for same amount, different secrets', async () => {
            const secret1 = CryptoUtils.generateSecret();
            const secret2 = CryptoUtils.generateSecret();
            
            const comm1 = await CryptoUtils.computeCommitment(1000, secret1, 0);
            const comm2 = await CryptoUtils.computeCommitment(1000, secret2, 0);
            
            expect(comm1).not.toBe(comm2);
        });

        it('should generate different commitments for same amount/secret, different indices', async () => {
            const secret = CryptoUtils.generateSecret();
            
            const comm1 = await CryptoUtils.computeCommitment(1000, secret, 0);
            const comm2 = await CryptoUtils.computeCommitment(1000, secret, 1);
            
            expect(comm1).not.toBe(comm2);
        });
    });
});

