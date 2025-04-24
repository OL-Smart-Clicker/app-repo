import dotenv from 'dotenv';
import { CosmosClient, Database } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';

dotenv.config();

const production = process.env.PRODUCTION === "true";
var client: CosmosClient | null = null;

if (production) {
    const credential = new DefaultAzureCredential();

    client = new CosmosClient({
        endpoint: process.env.COSMOS_DB_ENDPOINT!,
        aadCredentials: credential
    });
}
else {
    client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING!);
}

const database: Database = client.database(process.env.COSMOS_DB_DATABASE!);

export default database;