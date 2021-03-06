import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = process.env.AUTH0_JWKS_URL
let certCached : string   // cache the certificate

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {

  // TODO: Implement token verification
  // You should implement it simAWSXRayilarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const token = getToken(authHeader)
  const cert = await getCertificate()

  logger.info(`Verifying token`)

  return verify(token, cert, {algorithms: ['RSA256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  
  logger.info(`Getting Token`)

  if (!authHeader)
    throw new Error('No authentication header')  

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getCertificate(): Promise<string> {

  logger.info(`Getting Certificate`)

  // directly return if we already fetched the certificate
  if(certCached)
    return certCached;

  // load the certificate from the provided jwksUrl and extract the keys
  const response = await Axios.get(jwksUrl)
  const keys = response.data.keys

  // if no keys have been received --> error
  if(!keys || !keys.length)
    throw new Error('Missing JWKS keys')

    // filter the signing keys from all the keys
    const sigKeys = keys.filter(
      key => key.use === 'sig'
          && key.kty === 'RSA'
          && key.alg === 'RS256'
          && key.n
          && key.e
          && key.kid
          && (key.x5c && key.x5c.length)
    )

    // if no signing keys have been found --> error
    if(!sigKeys.length)
      throw new Error('Missing JWKS signing keys')

    // for now we only use the first key and create the certificate
    certCached = sigKeys[0].x5c[0].match(/.{1,64}/g).join('\n')
    certCached = `-----BEGIN CERTIFICATE-----\n${certCached}\n-----END CERTIFICATE-----\n`

    return certCached
}
