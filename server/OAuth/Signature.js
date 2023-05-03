require('dotenv').config()
const KJUR = require('jsrsasign')

async function GetSignature(MN, ROLE) {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2

    const oHeader = { alg: 'HS256', typ: 'JWT' }

    const oPayload = {
        sdkKey: process.env.SDK_KEY,
        mn: MN,
        role: ROLE,
        iat: iat,
        exp: exp,
        appKey: process.env.SDK_KEY,
        tokenExp: iat + 60 * 60 * 2
    }

    const sHeader = JSON.stringify(oHeader)
    const sPayload = JSON.stringify(oPayload)
    const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, process.env.SDK_SECRET)
    return signature;
}

/**
 * *Payload*
 * 
 * {
 *      role : 0 or 1, mn or meetingnumber : Number
 * }
 */
module.exports = GetSignature;