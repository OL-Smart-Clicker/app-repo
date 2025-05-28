import { Container, Database } from "@azure/cosmos";
import database from "../db/db";

export class ClickerService {
  private database: Database;
  private container: Container;

  constructor() {
    this.database = database;
    this.container = this.database.container("clicker-data");
  }

  async getClickerData(): Promise<any> {
    const querySpec = {
      query: "SELECT * FROM c",
    };
    const { resources } = await this.container.items
      .query(querySpec)
      .fetchAll();
    return resources;
  }
}
