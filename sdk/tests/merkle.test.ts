/**
 * Merkle Tree Tests
 */

import { MerkleTree } from '../src/merkle';
import { CryptoUtils } from '../src/crypto';

describe('MerkleTree', () => {
    let tree: MerkleTree;

    beforeEach(() => {
        tree = new MerkleTree(32);
    });

    describe('insert', () => {
        it('should insert a commitment', async () => {
            const commitment = await CryptoUtils.poseidonHash([1, 2, 3]);
            await tree.insert(0, commitment);
            const root = await tree.getRoot();
            expect(root).toBeDefined();
        });

        it('should update root after insertion', async () => {
            const root1 = await tree.getRoot();
            const commitment = await CryptoUtils.poseidonHash([1, 2, 3]);
            await tree.insert(0, commitment);
            const root2 = await tree.getRoot();
            expect(root1).not.toBe(root2);
        });
    });

    describe('generatePath', () => {
        it('should generate path for index 0', async () => {
            const commitment = await CryptoUtils.poseidonHash([1, 2, 3]);
            await tree.insert(0, commitment);
            const path = await tree.generatePath(0);
            expect(path.pathElements).toHaveLength(32);
            expect(path.pathIndices).toHaveLength(32);
        });

        it('should generate path with correct indices', async () => {
            const commitment = await CryptoUtils.poseidonHash([1, 2, 3]);
            await tree.insert(5, commitment); // Index 5 = binary 101
            const path = await tree.generatePath(5);
            expect(path.pathIndices[0]).toBe(1); // LSB first
            expect(path.pathIndices[1]).toBe(0);
            expect(path.pathIndices[2]).toBe(1);
        });
    });

    describe('verifyPath', () => {
        it('should verify valid path', async () => {
            const commitment = await CryptoUtils.poseidonHash([1, 2, 3]);
            await tree.insert(0, commitment);
            const root = await tree.getRoot();
            const path = await tree.generatePath(0);
            
            const isValid = await tree.verifyPath(commitment, path.pathElements, path.pathIndices, root);
            expect(isValid).toBe(true);
        });

        it('should reject invalid path', async () => {
            const commitment = await CryptoUtils.poseidonHash([1, 2, 3]);
            await tree.insert(0, commitment);
            const root = await tree.getRoot();
            const path = await tree.generatePath(0);
            
            // Modify path element
            const invalidPath = [...path.pathElements];
            invalidPath[0] = await CryptoUtils.poseidonHash([999]);
            
            const isValid = await tree.verifyPath(commitment, invalidPath, path.pathIndices, root);
            expect(isValid).toBe(false);
        });

        it('should reject path with wrong root', async () => {
            const commitment = await CryptoUtils.poseidonHash([1, 2, 3]);
            await tree.insert(0, commitment);
            const path = await tree.generatePath(0);
            
            const wrongRoot = await CryptoUtils.poseidonHash([999]);
            const isValid = await tree.verifyPath(commitment, path.pathElements, path.pathIndices, wrongRoot);
            expect(isValid).toBe(false);
        });
    });

    describe('multiple insertions', () => {
        it('should handle multiple insertions', async () => {
            const comm1 = await CryptoUtils.poseidonHash([1]);
            const comm2 = await CryptoUtils.poseidonHash([2]);
            const comm3 = await CryptoUtils.poseidonHash([3]);
            
            await tree.insert(0, comm1);
            await tree.insert(1, comm2);
            await tree.insert(2, comm3);
            
            const root = await tree.getRoot();
            expect(root).toBeDefined();
            
            // Verify all paths
            const path1 = await tree.generatePath(0);
            const path2 = await tree.generatePath(1);
            const path3 = await tree.generatePath(2);
            
            expect(await tree.verifyPath(comm1, path1.pathElements, path1.pathIndices, root)).toBe(true);
            expect(await tree.verifyPath(comm2, path2.pathElements, path2.pathIndices, root)).toBe(true);
            expect(await tree.verifyPath(comm3, path3.pathElements, path3.pathIndices, root)).toBe(true);
        });
    });
});

