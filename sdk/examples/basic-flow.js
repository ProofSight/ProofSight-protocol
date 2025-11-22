const { ProofSightSDK } = require('../dist');
const { Connection, Keypair } = require('@solana/web3.js');

async function main() {
    console.log("Running ProofSight SDK Example...");

    // 1. Setup
    const connection = new Connection('https://api.devnet.solana.com');
    const wallet = Keypair.generate(); // Mock wallet

    const sdk = new ProofSightSDK({
        connection,
        wallet,
        network: 'devnet'
    });

    await sdk.initialize();

    // 2. Deposit
    console.log("Depositing 100 SOL...");
    const deposit = await sdk.deposit(100);
    console.log("Deposit Commitment:", deposit.commitment);

    // 3. Create Market
    console.log("Creating Market...");
    const market = await sdk.createMarket({
        question: "Will SOL reach $1000 in 2025?",
        outcomes: ["Yes", "No"],
        resolutionDate: new Date("2025-12-31"),
        initialLiquidity: 1000
    });
    console.log("Market ID:", market.id);

    // 4. Trade
    console.log("Placing private trade...");
    const pos = await sdk.createPosition({
        marketId: market.id,
        outcome: "Yes",
        amount: 50
    });
    console.log("Position Commitment:", pos.commitment);
}

main().catch(console.error);

