declare module 'scryptsy' {
    export default function scryptsy(
        password: Uint8Array,
        salt: Uint8Array,
        N: number,
        r: number,
        p: number,
        keyLength: number
    ): Uint8Array
}

