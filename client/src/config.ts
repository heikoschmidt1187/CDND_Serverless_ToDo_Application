// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'bc378efy15'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-6fg0e-ow.eu.auth0.com',            // Auth0 domain
  clientId: '58UD9HdRFenp7YnHnWBnlxc7Lhc1rkU6',   // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
