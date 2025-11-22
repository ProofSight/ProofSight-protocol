declare module 'snarkjs' {
    export namespace groth16 {
        interface Proof {
            pi_a: string[];
            pi_b: string[][];
            pi_c: string[];
        }
        
        interface FullProveResult {
            proof: Proof;
            publicSignals: any[];
        }
        
        function fullProve(
            input: any,
            wasmPath: string,
            zkeyPath: string
        ): Promise<FullProveResult>;
        
        function verify(
            vkey: any,
            publicSignals: any[],
            proof: Proof
        ): Promise<boolean>;
    }
}

