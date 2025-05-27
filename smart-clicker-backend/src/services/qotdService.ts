import { Database, Container } from "@azure/cosmos";
import database from "../db/db";
import { Qotd } from "../models/qotd";

export class QotdService {
  private database: Database;
  private container: Container;

  constructor() {
    this.database = database;
    this.container = this.database.container("qotd");
  }

  async createQotd(qotd: Qotd): Promise<Qotd> {
    const { resource } = await this.container.items.create(qotd);
    return resource as Qotd;
  }

  async getQotdsForOffice(officeSpaceId: string): Promise<Qotd[]> {
    const userQuerySpec = {
      query: "SELECT * FROM c WHERE c.officeSpaceId = @officeSpaceId",
      parameters: [
        {
          name: "@officeSpaceId",
          value: officeSpaceId,
        },
      ],
    };
    const { resources } = await this.container.items
      .query(userQuerySpec)
      .fetchAll();
    return resources as Qotd[];
  }

  async getQotdTodayForOffice(officeSpaceId: string): Promise<Qotd | null> {
    const userQuerySpec = {
      query:
        "SELECT * FROM c WHERE c.officeSpaceId = @officeSpaceId AND c.date = @date",
      parameters: [
        {
          name: "@officeSpaceId",
          value: officeSpaceId,
        },
        {
          name: "@date",
          value: new Date().toISOString().split("T")[0], // Format date as YYYY-MM-DD
        },
      ],
    };
    const { resources } = await this.container.items
      .query(userQuerySpec)
      .fetchAll();
    if (resources.length === 0) return null;
    return resources[0] as Qotd;
  }

  async getQotdById(id: string, officeSpaceId: string): Promise<Qotd | null> {
    const { resource } = await this.container.item(id, officeSpaceId).read();
    if (!resource) return null;
    return resource as Qotd;
  }

  async deleteQotd(id: string, officeSpaceId: string): Promise<void> {
    await this.container.item(id, officeSpaceId).delete();
  }

  async updateQotd(qotd: Qotd): Promise<Qotd | null> {
    const { resource } = await this.container
      .item(qotd.id!, qotd.officeSpaceId)
      .replace(qotd);
    if (!resource) return null;
    return resource as Qotd;
  }
}
