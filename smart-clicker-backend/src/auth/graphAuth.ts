import msal from '@azure/msal-node';
import dotenv from 'dotenv';

dotenv.config();

const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID!,
        authority: process.env.AUTHORITY!,
        clientSecret: process.env.CLIENT_SECRET!,
    }
};

const graphTokenRequest = {
    scopes: [process.env.GRAPH_API_ENDPOINT + '.default'],
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

async function getGraphToken(tokenRequest: msal.ClientCredentialRequest) {
    return await cca.acquireTokenByClientCredential(tokenRequest);
}

const graphConfig = {
    graphTokenRequest: graphTokenRequest,
    getGraphToken: getGraphToken
}

export default graphConfig
