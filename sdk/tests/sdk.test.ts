/**
 * ProofSight SDK Tests
 */

import { ProofSightSDK } from '../src/sdk';
import { CryptoUtils } from '../src/crypto';

// Mock Solana connection and wallet
const mockConnection = {
    getLatestBlockhash: jest.fn(),
    sendTransaction: jest.fn(),
} as any;

const mockWallet = {
    publicKey: { toString: () => 'mock_public_key' },
    signTransaction: jest.fn(),
    sendTransaction: jest.fn(),
} as any;

describe('ProofSightSDK', () => {
    let sdk: ProofSightSDK;

    beforeEach(() => {
        sdk = new ProofSightSDK({
            connection: mockConnection,
            wallet: mockWallet,
            network: 'devnet',
        });
    });

    describe('initialization', () => {
        it('should create SDK instance', () => {
            expect(sdk).toBeDefined();
        });

        it('should initialize successfully', async () => {
            await sdk.initialize();
            // SDK should be initialized without errors
        });
    });

    describe('deposit', () => {
        it('should create a deposit', async () => {
            await sdk.initialize();
            const result = await sdk.deposit(1000);
            
            expect(result).toBeDefined();
            expect(result.amount).toBe(1000);
            expect(result.commitment).toBeDefined();
            expect(result.signature).toBeDefined();
        });

        it('should generate unique commitments for different deposits', async () => {
            await sdk.initialize();
            const result1 = await sdk.deposit(1000);
            const result2 = await sdk.deposit(1000);
            
            // Commitments should be different (different secrets)
            expect(result1.commitment).not.toBe(result2.commitment);
        });
    });

    describe('createMarket', () => {
        it('should create a market', async () => {
            await sdk.initialize();
            const market = await sdk.createMarket({
                question: 'Will it rain tomorrow?',
                outcomes: ['Yes', 'No'],
                resolutionDate: new Date('2025-12-31'),
                initialLiquidity: 10000,
            });
            
            expect(market).toBeDefined();
            expect(market.id).toBeDefined();
            expect(market.question).toBe('Will it rain tomorrow?');
            expect(market.outcomes).toEqual(['Yes', 'No']);
        });
    });

    describe('createPosition', () => {
        it('should create a position', async () => {
            await sdk.initialize();
            const market = await sdk.createMarket({
                question: 'Test',
                outcomes: ['Yes', 'No'],
                resolutionDate: new Date(),
                initialLiquidity: 1000,
            });
            
            const position = await sdk.createPosition({
                marketId: market.id,
                outcome: 'Yes',
                amount: 500,
            });
            
            expect(position).toBeDefined();
            expect(position.marketId).toBe(market.id);
            expect(position.outcome).toBe('Yes');
            expect(position.amount).toBe(500);
            expect(position.commitment).toBeDefined();
        });
    });

    describe('withdraw', () => {
        it('should create a withdrawal', async () => {
            await sdk.initialize();
            const result = await sdk.withdraw({
                amount: 1000,
                recipient: mockWallet.publicKey,
            });
            
            expect(result).toBeDefined();
            expect(result.amount).toBe(1000);
            expect(result.nullifier).toBeDefined();
            expect(result.signature).toBeDefined();
        });
    });

    describe('getMarkets', () => {
        it('should return markets', async () => {
            await sdk.initialize();
            const markets = await sdk.getMarkets();
            expect(Array.isArray(markets)).toBe(true);
        });
    });

    describe('getPositions', () => {
        it('should return positions', async () => {
            await sdk.initialize();
            const positions = await sdk.getPositions();
            expect(Array.isArray(positions)).toBe(true);
        });
    });
});

