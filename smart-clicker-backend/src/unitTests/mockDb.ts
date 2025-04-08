import dotenv from 'dotenv';
import { CosmosClient, Database } from '@azure/cosmos';

dotenv.config();

const client = new CosmosClient(process.env.COSMOS_MOCK_DB_CONNECTION_STRING!);

const mockDatabase: Database = client.database(process.env.COSMOS_DB_MOCK_DATABASE!);

export default mockDatabase;