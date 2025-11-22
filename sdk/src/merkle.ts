/**
 * Sparse Merkle Tree Implementation
 * 
 * Manages the client-side view of the state tree for witness generation.
 * Uses Poseidon hash for SNARK-friendly Merkle tree construction.
 */

import { CryptoUtils } from './crypto';
import { BN } from 'bn.js';

export class MerkleTree {
    private levels: number;
    private leaves: Map<number, string>;
    private nodes: Map<string, string>; // Cache of computed nodes
    private zeroValue: string;

    constructor(levels: number = 32) {
        this.levels = levels;
        this.leaves = new Map();
        this.nodes = new Map();
        // Zero value is Poseidon hash of [0, 0]
        this.zeroValue = '0x0'; // Will be computed on first use
    }

    /**
     * Initialize zero value using Poseidon hash
     */
    private async initializeZeroValue(): Promise<void> {
        if (this.zeroValue === '0x0') {
            this.zeroValue = await CryptoUtils.poseidonHash([0, 0]);
        }
    }

    /**
     * Hash two nodes together using Poseidon
     */
    private async hashNodes(left: string, right: string): Promise<string> {
        // Ensure both are hex strings, then pass directly to poseidonHash
        const leftHex = left.startsWith('0x') ? left : '0x' + left;
        const rightHex = right.startsWith('0x') ? right : '0x' + right;
        return await CryptoUtils.poseidonHash([leftHex, rightHex]);
    }

    /**
     * Insert a commitment into the tree
     */
    async insert(index: number, commitment: string): Promise<void> {
        await this.initializeZeroValue();
        this.leaves.set(index, commitment);
        // Invalidate cached nodes that depend on this leaf
        this.nodes.clear();
    }

    /**
     * Get the node at a specific level and position
     */
    private async getNode(level: number, index: number): Promise<string> {
        await this.initializeZeroValue();
        
        const key = `${level}-${index}`;
        if (this.nodes.has(key)) {
            return this.nodes.get(key)!;
        }

        if (level === 0) {
            // Leaf level
            const leaf = this.leaves.get(index) || this.zeroValue;
            this.nodes.set(key, leaf);
            return leaf;
        }

        // Internal node - hash children
        const leftIndex = index * 2;
        const rightIndex = index * 2 + 1;
        const left = await this.getNode(level - 1, leftIndex);
        const right = await this.getNode(level - 1, rightIndex);
        const hash = await this.hashNodes(left, right);
        this.nodes.set(key, hash);
        return hash;
    }

    /**
     * Compute the current root of the tree
     */
    async getRoot(): Promise<string> {
        await this.initializeZeroValue();
        return await this.getNode(this.levels, 0);
    }

    /**
     * Generate Merkle Path for a given index
     * Returns path elements (sibling hashes) and path indices (left/right directions)
     */
    async generatePath(index: number): Promise<{ pathElements: string[], pathIndices: number[] }> {
        await this.initializeZeroValue();
        
        const pathElements: string[] = [];
        const pathIndices: number[] = [];
        
        let currentIndex = index;
        
        for (let level = 0; level < this.levels; level++) {
            const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
            const sibling = await this.getNode(level, siblingIndex);
            pathElements.push(sibling);
            pathIndices.push(currentIndex % 2);
            currentIndex = Math.floor(currentIndex / 2);
        }
        
        return { pathElements, pathIndices };
    }

    /**
     * Verify a Merkle path
     */
    async verifyPath(
        leaf: string,
        pathElements: string[],
        pathIndices: number[],
        root: string
    ): Promise<boolean> {
        await this.initializeZeroValue();
        
        let currentHash = leaf;
        
        for (let i = 0; i < pathElements.length; i++) {
            const sibling = pathElements[i];
            const isRight = pathIndices[i] === 1;
            
            if (isRight) {
                currentHash = await this.hashNodes(sibling, currentHash);
            } else {
                currentHash = await this.hashNodes(currentHash, sibling);
            }
        }
        
        return currentHash.toLowerCase() === root.toLowerCase();
    }
}

