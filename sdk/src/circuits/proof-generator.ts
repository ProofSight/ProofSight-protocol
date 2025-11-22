/**
 * Proof Generation Utilities
 * 
 * Handles ZK proof generation using snarkjs and compiled circuit WASM files
 */

import * as snarkjs from 'snarkjs';
import { BN } from 'bn.js';

export interface ProofInputs {
    [key: string]: string | number | string[] | number[];
}

export interface ProofResult {
    proof: {
        pi_a: string[];
        pi_b: string[][];
        pi_c: string[];
    };
    publicSignals: string[];
}

export class ProofGenerator {
    /**
     * Generate a proof for a circuit
     * 
     * @param wasmPath - Path to circuit WASM file
     * @param zkeyPath - Path to proving key (zkey file)
     * @param inputs - Private and public inputs for the circuit
     * @returns Proof and public signals
     */
    static async generateProof(
        wasmPath: string,
        zkeyPath: string,
        inputs: ProofInputs
    ): Promise<ProofResult> {
        try {
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                inputs,
                wasmPath,
                zkeyPath
            );

            return {
                proof: {
                    pi_a: proof.pi_a,
                    pi_b: proof.pi_b,
                    pi_c: proof.pi_c,
                },
                publicSignals: publicSignals.map((s: any) => s.toString()),
            };
        } catch (error) {
            throw new Error(`Proof generation failed: ${error}`);
        }
    }

    /**
     * Verify a proof
     * 
     * @param vkeyPath - Path to verification key (JSON file)
     * @param publicSignals - Public signals from the proof
     * @param proof - The proof to verify
     * @returns True if proof is valid
     */
    static async verifyProof(
        vkeyPath: string,
        publicSignals: string[],
        proof: ProofResult['proof']
    ): Promise<boolean> {
        try {
            const vkey = await fetch(vkeyPath).then(r => r.json());
            const res = await snarkjs.groth16.verify(
                vkey,
                publicSignals,
                proof
            );
            return res;
        } catch (error) {
            throw new Error(`Proof verification failed: ${error}`);
        }
    }

    /**
     * Convert inputs to BigInt format required by snarkjs
     */
    static formatInputs(inputs: ProofInputs): any {
        const formatted: any = {};
        
        for (const [key, value] of Object.entries(inputs)) {
            if (Array.isArray(value)) {
                formatted[key] = value.map(v => 
                    typeof v === 'string' && v.startsWith('0x') 
                        ? BigInt(v) 
                        : BigInt(v)
                );
            } else {
                formatted[key] = typeof value === 'string' && value.startsWith('0x')
                    ? BigInt(value)
                    : BigInt(value);
            }
        }
        
        return formatted;
    }
}

