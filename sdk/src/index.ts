/**
 * ProofSight SDK
 * 
 * Privacy-preserving prediction markets on Solana
 * 
 * @packageDocumentation
 */

export { ProofSightSDK } from './sdk';
export * from './types';
export * from './crypto';
export * from './merkle';

// Re-export commonly used Solana types
export type { Connection, PublicKey, Transaction } from '@solana/web3.js';
