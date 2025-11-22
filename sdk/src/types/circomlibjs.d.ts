declare module 'circomlibjs' {
    export function buildPedersenHash(): Promise<(inputs: string[]) => any>;
    export function buildPoseidon(): Promise<(inputs: BigInt[]) => any>;
}

