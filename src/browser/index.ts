import CryptoJS from 'crypto-js'
import { syncScrypt } from 'scrypt-js'

export type BrowserBinaryLike = string | ArrayBuffer | ArrayBufferView

export interface EncryptResult {
    iv: Uint8Array
    data: string
}

const encoder = new TextEncoder()

const SCRYPT_PARAMS = {
    N: 16384,
    r: 8,
    p: 1,
    keyLength: 32
}

function toUint8Array(input: BrowserBinaryLike): Uint8Array {
    if (typeof input === 'string') {
        return encoder.encode(input)
    }
    if (input instanceof Uint8Array) {
        return input
    }
    if (ArrayBuffer.isView(input)) {
        return new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
    }
    if (input instanceof ArrayBuffer) {
        return new Uint8Array(input)
    }
    throw new TypeError('Unsupported binary-like input')
}

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
}

function deriveKey(password: BrowserBinaryLike, salt: BrowserBinaryLike): Uint8Array {
    return syncScrypt(
        toUint8Array(password),
        toUint8Array(salt),
        SCRYPT_PARAMS.N,
        SCRYPT_PARAMS.r,
        SCRYPT_PARAMS.p,
        SCRYPT_PARAMS.keyLength
    )
}

function toWordArray(values: Uint8Array) {
    return CryptoJS.enc.Hex.parse(bytesToHex(values))
}

export function encrypt(data: string, password: BrowserBinaryLike, salt: BrowserBinaryLike): EncryptResult {
    const iv = crypto.getRandomValues(new Uint8Array(16))
    const keyWordArray = toWordArray(deriveKey(password, salt))
    const ivWordArray = toWordArray(iv)

    const encrypted = CryptoJS.AES.encrypt(data, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })

    return {
        iv,
        data: encrypted.ciphertext.toString(CryptoJS.enc.Hex) + '\n' + Array.from(iv).map(i => i.toString(16).padStart(2, '0')).join('')
    }
}

export function decrypt(encryptedResultWithEOL: string, password: BrowserBinaryLike, salt: BrowserBinaryLike) {
    const contentArray = encryptedResultWithEOL.split(/\r\n|\n|\r/).filter(Boolean)
    const [data, iv] = contentArray
    if (!data || !iv) {
        throw new Error('Invalid encrypted payload')
    }
    const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(data)
    })
    const keyWordArray = toWordArray(deriveKey(password, salt))
    const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWordArray, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })

    return CryptoJS.enc.Utf8.stringify(decrypted)
}