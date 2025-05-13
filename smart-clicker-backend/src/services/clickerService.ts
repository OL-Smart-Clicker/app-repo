import { Database } from "@azure/cosmos";
import database from "../db/db";

export class ClickerService {
    private database: Database;

    constructor() {
        this.database = database;
    }

    async getClickerData(): Promise<any> {
        const container = this.database.container("clicker-data");
        const querySpec = {
            query: 'SELECT * FROM c'
        };
        const { resources } = await container.items.query(querySpec).fetchAll();
        return resources;
    }
}