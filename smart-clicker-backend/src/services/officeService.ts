import { Database, Container } from "@azure/cosmos";
import database from "../db/db";
import { Office } from "../models/office";

export class OfficeService {
    private database: Database;
    private container: Container;

    constructor() {
        this.database = database;
        this.container = this.database.container("offices");
    }

    async createOffice(office: Office): Promise<Office> {
        const { resource } = await this.container.items.create(office);
        return resource as Office;
    }

    async getOfficeByTenantId(id: string, tenantId: string): Promise<Office | null> {
        const { resource } = await this.container.item(id, tenantId).read();
        if (!resource) return null;
        return resource as Office;
    }    async updateOffice(office: Office): Promise<Office | null> {
        const { resource } = await this.container
            .item(office.id!, office.tenantId)
            .replace(office);
        if (!resource) return null;
        return resource as Office;
    }

    async getOfficesForTenant(tenantId: string): Promise<Office[]> {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.tenantId = @tenantId",
            parameters: [
                {
                    name: "@tenantId",
                    value: tenantId,
                },
            ],
        };
        const { resources } = await this.container.items.query(querySpec).fetchAll();
        return resources as Office[];
    }
}
