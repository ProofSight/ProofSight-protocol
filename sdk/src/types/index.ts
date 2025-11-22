/**
 * Type definitions for ProofSight SDK
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Network configuration
 */
export type Network = 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet';

/**
 * Proof generation configuration
 */
export interface ProofConfig {
  /** Path to WASM file for proof generation */
  wasmPath?: string;
  /** Timeout for proof generation in milliseconds */
  timeout?: number;
  /** Use web worker for non-blocking proof generation */
  useWorker?: boolean;
}

/**
 * SDK initialization options
 */
export interface ProofSightSDKOptions {
  /** Solana connection */
  connection: any; // Connection from @solana/web3.js
  /** Wallet instance */
  wallet: any; // Wallet from @solana/web3.js
  /** Network to connect to */
  network: Network;
  /** Proof generation configuration */
  proofConfig?: ProofConfig;
}

/**
 * Market creation options
 */
export interface CreateMarketOptions {
  /** Market question */
  question: string;
  /** Possible outcomes */
  outcomes: string[];
  /** Resolution date */
  resolutionDate: Date;
  /** Initial liquidity in SOL */
  initialLiquidity: number;
  /** Optional: Market description */
  description?: string;
  /** Optional: Category */
  category?: string;
}

/**
 * Market information
 */
export interface Market {
  /** Market ID */
  id: string;
  /** Market question */
  question: string;
  /** Possible outcomes */
  outcomes: string[];
  /** Current odds for each outcome */
  currentOdds: Record<string, number>;
  /** Total liquidity */
  totalLiquidity: number;
  /** 24h volume */
  volume24h: number;
  /** Resolution date */
  resolutionDate: Date;
  /** Market status */
  status: 'active' | 'resolved' | 'cancelled';
  /** Resolved outcome (if resolved) */
  resolvedOutcome?: string;
}

/**
 * Position creation options
 */
export interface CreatePositionOptions {
  /** Market ID */
  marketId: string;
  /** Outcome to bet on */
  outcome: string;
  /** Amount in SOL */
  amount: number;
}

/**
 * Position information
 */
export interface Position {
  /** Position ID */
  id: string;
  /** Market ID */
  marketId: string;
  /** Outcome */
  outcome: string;
  /** Position commitment (private) */
  commitment: string;
  /** Amount */
  amount: number;
}

/**
 * Deposit result
 */
export interface DepositResult {
  /** Deposit amount */
  amount: number;
  /** Deposit commitment */
  commitment: string;
  /** Transaction signature */
  signature: string;
}

/**
 * Withdrawal options
 */
export interface WithdrawOptions {
  /** Amount to withdraw */
  amount: number;
  /** Recipient address */
  recipient: PublicKey;
}

/**
 * Withdrawal result
 */
export interface WithdrawResult {
  /** Withdrawn amount */
  amount: number;
  /** Transaction signature */
  signature: string;
  /** Nullifier (prevents double-spending) */
  nullifier: string;
}

/**
 * Market query options
 */
export interface GetMarketsOptions {
  /** Filter by status */
  status?: 'active' | 'resolved' | 'cancelled';
  /** Filter by category */
  category?: string;
  /** Limit results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Position query options
 */
export interface GetPositionsOptions {
  /** Filter by market ID */
  marketId?: string;
  /** Filter by outcome */
  outcome?: string;
}

