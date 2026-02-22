import { createHmac } from 'crypto'
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30'

const parseJwt = (token: string) => {
    const tokenSplit = token.split(".")

    if(tokenSplit.length != 3) {
        console.log("invalid length")
        process.exit(1)
    }

    const header = tokenSplit[0]
    const payload = tokenSplit[1]
    const singature = tokenSplit[2];

    const headerDecoded = atob(header)
    const payloadDecoded = atob(payload)


    const isVerified = verifySignature(singature, "a-string-secret-at-least-256-bits-long", `${header}.${payload}`)

}


const verifySignature = (signatureToCmp: string, secret: string, data: string) => {
    const expectedSignature = createHmac('sha256', secret).update(data).digest('base64url')

    return expectedSignature == signatureToCmp
}

parseJwt(token);