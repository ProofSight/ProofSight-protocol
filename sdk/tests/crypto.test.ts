/**
 * Cryptographic Utilities Tests
 */

import { CryptoUtils } from '../src/crypto';
import { BN } from 'bn.js';

describe('CryptoUtils', () => {
    describe('generateSecret', () => {
        it('should generate a 64-character hex string', () => {
            const secret = CryptoUtils.generateSecret();
            expect(secret).toMatch(/^[0-9a-f]{64}$/);
        });

        it('should generate unique secrets', () => {
            const secret1 = CryptoUtils.generateSecret();
            const secret2 = CryptoUtils.generateSecret();
            expect(secret1).not.toBe(secret2);
        });
    });

    describe('poseidonHash', () => {
        it('should hash single input', async () => {
            const hash = await CryptoUtils.poseidonHash([123]);
            expect(hash).toMatch(/^0x[0-9a-f]+$/);
            expect(hash.length).toBeGreaterThan(0);
        });

        it('should hash multiple inputs', async () => {
            const hash = await CryptoUtils.poseidonHash([1, 2, 3]);
            expect(hash).toMatch(/^0x[0-9a-f]+$/);
        });

        it('should produce deterministic hashes', async () => {
            const hash1 = await CryptoUtils.poseidonHash([123, 456]);
            const hash2 = await CryptoUtils.poseidonHash([123, 456]);
            expect(hash1).toBe(hash2);
        });

        it('should produce different hashes for different inputs', async () => {
            const hash1 = await CryptoUtils.poseidonHash([123, 456]);
            const hash2 = await CryptoUtils.poseidonHash([123, 789]);
            expect(hash1).not.toBe(hash2);
        });
    });

    describe('pedersenCommitment', () => {
        it('should create a commitment', async () => {
            const randomness = CryptoUtils.generateSecret();
            const commitment = await CryptoUtils.pedersenCommitment(1000, randomness);
            expect(commitment).toMatch(/^0x[0-9a-f]+$/);
        });

        it('should produce different commitments for different values', async () => {
            const randomness = CryptoUtils.generateSecret();
            const comm1 = await CryptoUtils.pedersenCommitment(1000, randomness);
            const comm2 = await CryptoUtils.pedersenCommitment(2000, randomness);
            expect(comm1).not.toBe(comm2);
        });

        it('should produce different commitments for different randomness', async () => {
            const rand1 = CryptoUtils.generateSecret();
            const rand2 = CryptoUtils.generateSecret();
            const comm1 = await CryptoUtils.pedersenCommitment(1000, rand1);
            const comm2 = await CryptoUtils.pedersenCommitment(1000, rand2);
            expect(comm1).not.toBe(comm2);
        });
    });

    describe('computeCommitment', () => {
        it('should compute commitment matching circuit', async () => {
            const secret = CryptoUtils.generateSecret();
            const commitment = await CryptoUtils.computeCommitment(1000, secret, 0);
            expect(commitment).toMatch(/^0x[0-9a-f]+$/);
        });

        it('should produce different commitments for different indices', async () => {
            const secret = CryptoUtils.generateSecret();
            const comm1 = await CryptoUtils.computeCommitment(1000, secret, 0);
            const comm2 = await CryptoUtils.computeCommitment(1000, secret, 1);
            expect(comm1).not.toBe(comm2);
        });
    });

    describe('computeNullifier', () => {
        it('should compute nullifier from secret and commitment', async () => {
            const secret = CryptoUtils.generateSecret();
            const commitment = await CryptoUtils.computeCommitment(1000, secret, 0);
            const nullifier = await CryptoUtils.computeNullifier(secret, commitment);
            expect(nullifier).toMatch(/^0x[0-9a-f]+$/);
        });

        it('should produce deterministic nullifiers', async () => {
            const secret = CryptoUtils.generateSecret();
            const commitment = await CryptoUtils.computeCommitment(1000, secret, 0);
            const null1 = await CryptoUtils.computeNullifier(secret, commitment);
            const null2 = await CryptoUtils.computeNullifier(secret, commitment);
            expect(null1).toBe(null2);
        });

        it('should produce different nullifiers for different commitments', async () => {
            const secret = CryptoUtils.generateSecret();
            const comm1 = await CryptoUtils.computeCommitment(1000, secret, 0);
            const comm2 = await CryptoUtils.computeCommitment(1000, secret, 1);
            const null1 = await CryptoUtils.computeNullifier(secret, comm1);
            const null2 = await CryptoUtils.computeNullifier(secret, comm2);
            expect(null1).not.toBe(null2);
        });
    });
});

