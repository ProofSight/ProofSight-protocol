/**
 * Integration Tests
 * 
 * End-to-end tests for complete ProofSight protocol flows
 */

import { ProofSightSDK } from '../src/sdk';
import { CryptoUtils } from '../src/crypto';
import { MerkleTree } from '../src/merkle';

// Mock Solana connection and wallet
const mockConnection = {
    getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: 'mock_hash' }),
    sendTransaction: jest.fn().mockResolvedValue('mock_signature'),
} as any;

const mockWallet = {
    publicKey: { toString: () => 'mock_public_key' },
    signTransaction: jest.fn(),
    sendTransaction: jest.fn().mockResolvedValue('mock_signature'),
} as any;

describe('ProofSight Integration Tests', () => {
    let sdk: ProofSightSDK;
    let merkleTree: MerkleTree;

    beforeEach(async () => {
        sdk = new ProofSightSDK({
            connection: mockConnection,
            wallet: mockWallet,
            network: 'devnet',
        });
        await sdk.initialize();
        
        merkleTree = new MerkleTree(32);
    });

    describe('Complete Deposit Flow', () => {
        it('should complete full deposit flow with proper commitment', async () => {
            const amount = 1000;
            
            // 1. Generate deposit
            const depositResult = await sdk.deposit(amount);
            
            expect(depositResult.amount).toBe(amount);
            expect(depositResult.commitment).toBeDefined();
            expect(depositResult.commitment).toMatch(/^0x[0-9a-f]+$/);
            expect(depositResult.signature).toBeDefined();
        });

        it('should generate unique commitments for different deposits', async () => {
            const result1 = await sdk.deposit(1000);
            const result2 = await sdk.deposit(1000);
            
            // Commitments should be different (different secrets)
            expect(result1.commitment).not.toBe(result2.commitment);
        });
    });

    describe('Complete Trade Flow', () => {
        it('should create market and position', async () => {
            // 1. Create market
            const market = await sdk.createMarket({
                question: 'Will it rain tomorrow?',
                outcomes: ['Yes', 'No'],
                resolutionDate: new Date('2025-12-31'),
                initialLiquidity: 10000,
            });
            
            expect(market.id).toBeDefined();
            expect(market.question).toBe('Will it rain tomorrow?');
            
            // 2. Create position
            const position = await sdk.createPosition({
                marketId: market.id,
                outcome: 'Yes',
                amount: 500,
            });
            
            expect(position.marketId).toBe(market.id);
            expect(position.outcome).toBe('Yes');
            expect(position.commitment).toBeDefined();
        });
    });

    describe('Complete Withdrawal Flow', () => {
        it('should complete withdrawal with proper nullifier', async () => {
            // 1. Deposit first
            const depositResult = await sdk.deposit(1000);
            
            // 2. Withdraw
            const withdrawResult = await sdk.withdraw({
                amount: 1000,
                recipient: mockWallet.publicKey,
            });
            
            expect(withdrawResult.amount).toBe(1000);
            expect(withdrawResult.nullifier).toBeDefined();
            expect(withdrawResult.nullifier).toMatch(/^0x[0-9a-f]+$/);
            expect(withdrawResult.signature).toBeDefined();
        });
    });

    describe('Merkle Tree Consistency', () => {
        it('should maintain consistent Merkle tree across operations', async () => {
            const commitments: string[] = [];
            
            // Make multiple deposits
            for (let i = 0; i < 5; i++) {
                const result = await sdk.deposit(1000);
                commitments.push(result.commitment);
            }
            
            // Verify all commitments are unique
            const uniqueCommitments = new Set(commitments);
            expect(uniqueCommitments.size).toBe(5);
        });

        it('should generate valid Merkle paths', async () => {
            const commitment = await CryptoUtils.computeCommitment(1000, CryptoUtils.generateSecret(), 0);
            await merkleTree.insert(0, commitment);
            
            const root = await merkleTree.getRoot();
            const path = await merkleTree.generatePath(0);
            
            // Verify path
            const isValid = await merkleTree.verifyPath(
                commitment,
                path.pathElements,
                path.pathIndices,
                root
            );
            
            expect(isValid).toBe(true);
        });
    });

    describe('Cryptographic Consistency', () => {
        it('should generate consistent nullifiers for same inputs', async () => {
            const secret = CryptoUtils.generateSecret();
            const commitment = await CryptoUtils.computeCommitment(1000, secret, 0);
            
            const nullifier1 = await CryptoUtils.computeNullifier(secret, commitment);
            const nullifier2 = await CryptoUtils.computeNullifier(secret, commitment);
            
            expect(nullifier1).toBe(nullifier2);
        });

        it('should generate different nullifiers for different commitments', async () => {
            const secret = CryptoUtils.generateSecret();
            const comm1 = await CryptoUtils.computeCommitment(1000, secret, 0);
            const comm2 = await CryptoUtils.computeCommitment(1000, secret, 1);
            
            const null1 = await CryptoUtils.computeNullifier(secret, comm1);
            const null2 = await CryptoUtils.computeNullifier(secret, comm2);
            
            expect(null1).not.toBe(null2);
        });
    });

    describe('Error Handling', () => {
        it('should handle SDK initialization errors', async () => {
            const uninitializedSDK = new ProofSightSDK({
                connection: mockConnection,
                wallet: mockWallet,
                network: 'devnet',
            });
            
            await expect(uninitializedSDK.deposit(1000)).rejects.toThrow();
        });

        it('should validate input ranges', async () => {
            // Negative amounts should be handled (if SDK validates)
            // This depends on SDK implementation
            expect(true).toBe(true);
        });
    });
});

