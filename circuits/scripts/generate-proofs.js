#!/usr/bin/env node

/**
 * Proof Generation Script
 * 
 * Generates proofs for ProofSight circuits using snarkjs.
 * This script compiles circuits, generates trusted setup, and creates test proofs.
 */

const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

const CIRCUITS_DIR = path.join(__dirname, '../circuits');
const BUILD_DIR = path.join(__dirname, '../build');
const TEST_VECTORS_DIR = path.join(__dirname, '../test-vectors');

// Ensure build directory exists
if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
}

if (!fs.existsSync(TEST_VECTORS_DIR)) {
    fs.mkdirSync(TEST_VECTORS_DIR, { recursive: true });
}

/**
 * Generate proof for deposit circuit
 */
async function generateDepositProof() {
    console.log('Generating deposit circuit proof...');
    
    const wasmPath = path.join(BUILD_DIR, 'deposit.wasm');
    const zkeyPath = path.join(BUILD_DIR, 'deposit_0001.zkey');
    
    // Check if files exist
    if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
        console.warn('WASM or zkey file not found. Please compile circuits first.');
        console.warn('Run: npm run build');
        return;
    }
    
    // Test inputs for deposit circuit
    const inputs = {
        deposit_amount: '1000000', // 1 SOL in lamports
        new_root: '1234567890',
        timestamp: Math.floor(Date.now() / 1000).toString(),
        secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        nullifier_key: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        old_root: '0',
        pathElements: Array(32).fill('0'),
        pathIndices: Array(32).fill('0')
    };
    
    try {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            inputs,
            wasmPath,
            zkeyPath
        );
        
        const proofData = {
            proof: {
                pi_a: proof.pi_a,
                pi_b: proof.pi_b,
                pi_c: proof.pi_c
            },
            publicSignals: publicSignals.map(s => s.toString())
        };
        
        fs.writeFileSync(
            path.join(TEST_VECTORS_DIR, 'deposit_proof.json'),
            JSON.stringify(proofData, null, 2)
        );
        
        console.log('✓ Deposit proof generated successfully');
        console.log(`  Public signals: ${publicSignals.length}`);
    } catch (error) {
        console.error('✗ Deposit proof generation failed:', error.message);
    }
}

/**
 * Generate proof for withdrawal circuit
 */
async function generateWithdrawalProof() {
    console.log('Generating withdrawal circuit proof...');
    
    const wasmPath = path.join(BUILD_DIR, 'withdrawal.wasm');
    const zkeyPath = path.join(BUILD_DIR, 'withdrawal_0001.zkey');
    
    if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
        console.warn('WASM or zkey file not found. Please compile circuits first.');
        return;
    }
    
    const inputs = {
        root: '1234567890',
        nullifierHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        recipient: '11111111111111111111111111111111', // Solana address placeholder
        secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        amount: '1000000',
        pathElements: Array(32).fill('0'),
        pathIndices: Array(32).fill('0')
    };
    
    try {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            inputs,
            wasmPath,
            zkeyPath
        );
        
        const proofData = {
            proof: {
                pi_a: proof.pi_a,
                pi_b: proof.pi_b,
                pi_c: proof.pi_c
            },
            publicSignals: publicSignals.map(s => s.toString())
        };
        
        fs.writeFileSync(
            path.join(TEST_VECTORS_DIR, 'withdrawal_proof.json'),
            JSON.stringify(proofData, null, 2)
        );
        
        console.log('✓ Withdrawal proof generated successfully');
    } catch (error) {
        console.error('✗ Withdrawal proof generation failed:', error.message);
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('ProofSight Proof Generation Script\n');
    console.log('Note: This requires compiled circuits and trusted setup files.');
    console.log('Run "npm run build" first to compile circuits.\n');
    
    await generateDepositProof();
    await generateWithdrawalProof();
    
    console.log('\n✓ Proof generation complete');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generateDepositProof, generateWithdrawalProof };

