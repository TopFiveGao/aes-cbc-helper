import * as crypto from 'node:crypto'


export function encrypt(data: string, password: crypto.BinaryLike, salt: crypto.BinaryLike) {
    const iv: Buffer = crypto.randomBytes(16)
    const key = crypto.scryptSync(password, salt, 32)
    const tool = crypto.createCipheriv('aes-256-cbc', key, iv)
    let res = tool.update(data, 'utf-8', 'hex')
    res += tool.final('hex')
    return {
        iv,
        data: res + '\n' + iv.toString('hex')
    }
}

export function decrypt(encryptedResultWithEOL: string, password: crypto.BinaryLike, salt: crypto.BinaryLike) {
    const contentArray = encryptedResultWithEOL.split(/\r\n|\n|\r/).filter(Boolean)
    const contentObj = { data: contentArray[0], iv: contentArray[1] }
    const { iv, data } = contentObj
    const key = crypto.scryptSync(password, salt, 32)
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}
