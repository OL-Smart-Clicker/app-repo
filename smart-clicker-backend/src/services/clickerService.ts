import { Container, Database } from "@azure/cosmos";
import database from "../db/db";

export class ClickerService {
  private database: Database;
  private container: Container;

  constructor() {
    this.database = database;
    this.container = this.database.container("clicker-data");
  }

  async getClicksAll(officeSpaceId: string): Promise<number> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.Properties.officeSpaceId = @officeSpaceId",
      parameters: [
        {
          name: "@officeSpaceId",
          value: officeSpaceId,
        },
      ]
    };
    const { resources } = await this.container.items
      .query(querySpec)
      .fetchAll();
    return resources.length;
  }

  async getClicksWeek(officeSpaceId: string): Promise<number> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);
    const startTimestamp = Math.floor(startOfWeek.getTime() / 1000);

    const querySpec = {
      query: "SELECT * FROM c WHERE c.Properties.officeSpaceId = @officeSpaceId AND c._ts >= @startTimestamp",
      parameters: [
        {
          name: "@officeSpaceId",
          value: officeSpaceId,
        },
        {
          name: "@startTimestamp",
          value: startTimestamp,
        },
      ]
    };
    const { resources } = await this.container.items
      .query(querySpec)
      .fetchAll();
    return resources.length;
  }

  async getClickerDataByDate(officeSpaceId: string, startDate: Date, endDate: Date): Promise<any> {
    const startOfDay = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999));
    const startTimestamp = Math.floor(startOfDay.getTime() / 1000);
    const endTimestamp = Math.floor(endOfDay.getTime() / 1000);

    const query = {
      query: "SELECT * FROM c WHERE c.Properties.officeSpaceId = @officeSpaceId AND c._ts >= @startTimestamp AND c._ts <= @endTimestamp",
      parameters: [
        {
          name: "@officeSpaceId",
          value: officeSpaceId,
        },
        {
          name: "@startTimestamp",
          value: startTimestamp,
        },
        {
          name: "@endTimestamp",
          value: endTimestamp,
        },
      ]
    };
    const { resources } = await this.container.items
      .query(query)
      .fetchAll();
    return resources.map((item: any) => {
      if (item.Body) {
        try {
          return JSON.parse(atob(item.Body));
        } catch (e) {
          return item;
        }
      }
      return item;
    });
  }

  async exportClickerDataByDateCSV(officeSpaceId: string, startDate: Date, endDate: Date): Promise<string> {
    const startOfDay = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999));
    const startTimestamp = Math.floor(startOfDay.getTime() / 1000);
    const endTimestamp = Math.floor(endOfDay.getTime() / 1000);

    const query = {
      query: "SELECT * FROM c WHERE c.Properties.officeSpaceId = @officeSpaceId AND c._ts >= @startTimestamp AND c._ts <= @endTimestamp",
      parameters: [
        { name: "@officeSpaceId", value: officeSpaceId },
        { name: "@startTimestamp", value: startTimestamp },
        { name: "@endTimestamp", value: endTimestamp },
      ]
    };
    const { resources } = await this.container.items
      .query(query)
      .fetchAll();
    if (!resources || resources.length === 0) return '';
    // Decode Body property if present
    const decoded = resources.map((item: any) => {
      if (item.Body) {
        try {
          return JSON.parse(atob(item.Body));
        } catch (e) {
          return item;
        }
      }
      return item;
    });
    // Get all unique keys
    const keys = Array.from(new Set(decoded.flatMap((item: any) => Object.keys(item))));
    // CSV header
    const header = keys.join(',');
    // CSV rows
    const rows = decoded.map((item: any) => keys.map(k => JSON.stringify(item[k] ?? '')).join(','));
    return [header, ...rows].join('\n');
  }
}
