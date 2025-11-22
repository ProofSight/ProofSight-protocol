/**
 * Cryptographic primitives for ProofSight
 * Implements Baby JubJub curve operations and Pedersen commitments using circomlibjs
 */

import { BN } from 'bn.js';
import * as circomlib from 'circomlibjs';

// Lazy initialization of circomlib modules
let pedersenHash: any = null;
let poseidon: any = null;

async function getPedersenHash() {
    if (!pedersenHash) {
        pedersenHash = await circomlib.buildPedersenHash();
    }
    return pedersenHash;
}

async function getPoseidon() {
    if (!poseidon) {
        poseidon = await circomlib.buildPoseidon();
    }
    return poseidon;
}

export class CryptoUtils {
    // Baby JubJub Field Modulus (BN254 curve)
    static readonly FIELD_MODULUS = new BN('21888242871839275222246405745257275088548364400416034343698204186575808495617');

    /**
     * Generate a random field element (private key/secret)
     * Returns a hex string representation of 32 random bytes
     */
    static generateSecret(): string {
        const randomBytes = new Uint8Array(32);
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            crypto.getRandomValues(randomBytes);
        } else {
            // Node.js fallback - use crypto module
            const nodeCrypto = require('crypto');
            const buf = nodeCrypto.randomBytes(32);
            randomBytes.set(buf);
        }
        return Buffer.from(randomBytes).toString('hex');
    }

    /**
     * Compute Pedersen Commitment on Baby JubJub curve
     * C = PedersenHash(value, randomness)
     * 
     * Note: circomlib's PedersenHash is actually a hash function, not a full commitment scheme.
     * For full Pedersen commitments (v*G + r*H), we'd need elliptic curve operations.
     * This implementation uses PedersenHash which is SNARK-friendly and matches circuit usage.
     * 
     * @param value - The value to commit to (as number or BN instance)
     * @param randomness - Randomness as hex string
     * @returns Commitment as hex string
     */
    static async pedersenCommitment(value: number | InstanceType<typeof BN>, randomness: string): Promise<string> {
        const pedersen = await getPedersenHash();
        const v = typeof value === 'number' ? new BN(value) : value;
        const r = new BN(randomness, 'hex');
        
        // PedersenHash takes inputs as array of BigInts
        const inputs = [v.toString(), r.toString()];
        const hash = pedersen(inputs);
        
        // Convert to hex string
        return '0x' + hash.toString(16).padStart(64, '0');
    }

    /**
     * Compute Poseidon hash
     * Used for Merkle trees and nullifier generation
     * 
     * @param inputs - Array of inputs (numbers, BN instance, or hex strings)
     * @returns Hash as hex string
     */
    static async poseidonHash(inputs: (number | InstanceType<typeof BN> | string)[]): Promise<string> {
        const poseidonInstance = await getPoseidon();
        
        // Convert all inputs to BigInt
        const bigIntInputs = inputs.map(input => {
            if (typeof input === 'string') {
                // Handle hex strings
                if (input.startsWith('0x')) {
                    try {
                        return BigInt(input);
                    } catch {
                        // If invalid hex, try treating as decimal
                        return BigInt(parseInt(input, 16) || 0);
                    }
                }
                // Try hex first, then decimal
                try {
                    return BigInt('0x' + input);
                } catch {
                    return BigInt(input);
                }
            }
            if (BN.isBN(input)) {
                // BN toString() returns decimal, convert to BigInt
                return BigInt(input.toString(10));
            }
            // Number - convert directly
            return BigInt(input);
        });
        
        const hash = poseidonInstance(bigIntInputs);
        return '0x' + hash.toString(16).padStart(64, '0');
    }

    /**
     * Compute Nullifier for deposit/withdrawal
     * nullifier = Poseidon(secret, commitment)
     * 
     * This matches the circuit implementation where nullifier is derived from
     * secret + commitment, not from pathIndices alone.
     * 
     * @param secret - User's secret key (hex string)
     * @param commitment - The commitment hash (hex string)
     * @returns Nullifier as hex string
     */
    static async computeNullifier(secret: string, commitment: string): Promise<string> {
        return await this.poseidonHash([secret, commitment]);
    }

    /**
     * Compute Commitment for a deposit note
     * commitment = Poseidon(amount, secret, index)
     * 
     * This matches the deposit circuit implementation.
     * 
     * @param amount - Deposit amount
     * @param secret - User's secret key (hex string)
     * @param index - Leaf index in Merkle tree
     * @returns Commitment as hex string
     */
    static async computeCommitment(amount: number, secret: string, index: number): Promise<string> {
        // Pass numbers directly - poseidonHash will handle conversion
        return await this.poseidonHash([amount, secret, index]);
    }

    /**
     * Synchronous version of pedersenCommitment for backwards compatibility
     * WARNING: This uses a mock implementation. Use async version for real crypto.
     */
    static pedersenCommitmentSync(value: number, randomness: string): string {
        console.warn('pedersenCommitmentSync is deprecated. Use async pedersenCommitment for real cryptography.');
        const v = new BN(value);
        const r = new BN(randomness, 'hex');
        return `comm_${v.toString(16)}_${r.toString(16).substring(0,8)}`;
    }

    /**
     * Synchronous version of computeNullifier for backwards compatibility
     * WARNING: This uses a mock implementation. Use async version for real crypto.
     */
    static computeNullifierSync(secret: string, index: number): string {
        console.warn('computeNullifierSync is deprecated. Use async computeNullifier for real cryptography.');
        return `null_${secret.substring(0,8)}_${index}`;
    }
}

