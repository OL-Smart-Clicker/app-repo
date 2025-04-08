import dotenv from 'dotenv';
import { CosmosClient, Database } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';

dotenv.config();

const credential = new DefaultAzureCredential();

const client = new CosmosClient({
    endpoint: process.env.COSMOS_DB_ENDPOINT!,
    aadCredentials: credential
});

const database: Database = client.database(process.env.COSMOS_DB_DATABASE!);

export default database;