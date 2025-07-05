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
    const query = {
      query: "SELECT * FROM c WHERE c.officeSpaceId = @officeSpaceId",
      parameters: [
        {
          name: "@officeSpaceId",
          value: officeSpaceId,
        },
      ],
    };
    const { resources } = await this.container.items.query(query).fetchAll();
    return resources as Qotd[];
  }

  async getQotdForOffice(officeSpaceId: string, date: Date): Promise<Qotd | null> {
    const year = date.getFullYear().toString();
    const month =
      (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1).toString();
    const day = (date.getDate() < 10 ? "0" : "") + date.getDate().toString();
    const dateParam = `${year}-${month}-${day}`;
    const query = {
      query:
        "SELECT * FROM c WHERE c.officeSpaceId = @officeSpaceId AND STARTSWITH(c.date, @date)",
      parameters: [
        {
          name: "@officeSpaceId",
          value: officeSpaceId,
        },
        {
          name: "@date",
          value: dateParam,
        },
      ],
    };
    const { resources } = await this.container.items.query(query).fetchAll();
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

  async updateQotd(qotd: Qotd): Promise<Qotd | boolean> {
    const existingQotd = await this.getQotdForOffice(qotd.officeSpaceId, new Date(qotd.date));
    if (!existingQotd) {
      const { resource } = await this.container
        .item(qotd.id!, qotd.officeSpaceId)
        .replace(qotd);
      if (!resource) return false;
      return resource as Qotd;
    }
    else return true;
  }

  async getQotdsUntilToday(officeSpaceId: string): Promise<number> {
    const today = new Date();
    const query = {
      query:
        "SELECT * FROM c WHERE c.officeSpaceId = @officeSpaceId AND c.date <= @today",
      parameters: [
        {
          name: "@officeSpaceId",
          value: officeSpaceId,
        },
        {
          name: "@today",
          value: today.toISOString(),
        },
      ],
    };
    const { resources } = await this.container.items.query(query).fetchAll();
    return resources.length;
  }
}
