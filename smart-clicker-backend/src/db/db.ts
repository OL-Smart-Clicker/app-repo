import dotenv from 'dotenv';
import { CosmosClient, Database } from '@azure/cosmos';

dotenv.config();

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING!);

const database: Database = client.database(process.env.COSMOS_DB_DATABASE!);

export default database;