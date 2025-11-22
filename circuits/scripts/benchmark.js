#!/usr/bin/env node

/**
 * Circuit Benchmark Script
 * 
 * Benchmarks proof generation time for ProofSight circuits.
 * Target: <3 seconds per proof generation.
 */

const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../build');

/**
 * Benchmark a single proof generation
 */
async function benchmarkProof(wasmPath, zkeyPath, inputs, circuitName) {
    if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
        console.warn(`⚠ ${circuitName}: WASM or zkey not found, skipping benchmark`);
        return null;
    }
    
    const iterations = 3; // Run 3 times and average
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        try {
            await snarkjs.groth16.fullProve(inputs, wasmPath, zkeyPath);
            const elapsed = Date.now() - start;
            times.push(elapsed);
        } catch (error) {
            console.error(`✗ ${circuitName} proof generation failed:`, error.message);
            return null;
        }
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    return {
        circuit: circuitName,
        average: avgTime,
        min: minTime,
        max: maxTime,
        iterations: iterations,
        target: 3000, // 3 seconds target
        meetsTarget: avgTime < 3000
    };
}

/**
 * Benchmark all circuits
 */
async function benchmarkAll() {
    console.log('ProofSight Circuit Benchmarks\n');
    console.log('Target: <3 seconds per proof generation\n');
    
    const results = [];
    
    // Deposit circuit benchmark
    const depositInputs = {
        deposit_amount: '1000000',
        new_root: '1234567890',
        timestamp: Math.floor(Date.now() / 1000).toString(),
        secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        nullifier_key: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        old_root: '0',
        pathElements: Array(32).fill('0'),
        pathIndices: Array(32).fill('0')
    };
    
    const depositResult = await benchmarkProof(
        path.join(BUILD_DIR, 'deposit.wasm'),
        path.join(BUILD_DIR, 'deposit_0001.zkey'),
        depositInputs,
        'Deposit'
    );
    
    if (depositResult) {
        results.push(depositResult);
    }
    
    // Withdrawal circuit benchmark
    const withdrawalInputs = {
        root: '1234567890',
        nullifierHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        recipient: '11111111111111111111111111111111',
        secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        amount: '1000000',
        pathElements: Array(32).fill('0'),
        pathIndices: Array(32).fill('0')
    };
    
    const withdrawalResult = await benchmarkProof(
        path.join(BUILD_DIR, 'withdrawal.wasm'),
        path.join(BUILD_DIR, 'withdrawal_0001.zkey'),
        withdrawalInputs,
        'Withdrawal'
    );
    
    if (withdrawalResult) {
        results.push(withdrawalResult);
    }
    
    // Position update circuit benchmark
    const positionUpdateInputs = {
        market_id: '1',
        pool_token_a: '1000000000',
        pool_token_b: '1000000000',
        new_pool_token_a: '950000000',
        new_pool_token_b: '1052631579',
        amount_in: '50000000',
        is_buy_a: '1',
        min_amount_out: '40000000',
        user_secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        position_commitment: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    };
    
    const positionUpdateResult = await benchmarkProof(
        path.join(BUILD_DIR, 'position_update.wasm'),
        path.join(BUILD_DIR, 'position_update_0001.zkey'),
        positionUpdateInputs,
        'Position Update'
    );
    
    if (positionUpdateResult) {
        results.push(positionUpdateResult);
    }
    
    // Print results
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Benchmark Results');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    results.forEach(result => {
        const status = result.meetsTarget ? '✓' : '✗';
        console.log(`${status} ${result.circuit}:`);
        console.log(`   Average: ${result.average.toFixed(2)}ms`);
        console.log(`   Min: ${result.min.toFixed(2)}ms`);
        console.log(`   Max: ${result.max.toFixed(2)}ms`);
        console.log(`   Target: ${result.target}ms`);
        console.log(`   Status: ${result.meetsTarget ? 'PASS' : 'FAIL'}\n`);
    });
    
    // Save results to file
    fs.writeFileSync(
        path.join(BUILD_DIR, 'benchmark_results.json'),
        JSON.stringify(results, null, 2)
    );
    
    console.log(`Results saved to ${path.join(BUILD_DIR, 'benchmark_results.json')}`);
}

if (require.main === module) {
    benchmarkAll().catch(console.error);
}

module.exports = { benchmarkAll, benchmarkProof };

