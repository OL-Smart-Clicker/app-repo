import { Database, Container } from "@azure/cosmos";
import database from "../db/db";
import { Office } from "../models/office";
import { IoTService } from "./iotService";
import { QotdService } from "./qotdService";

export class OfficeService {
    private database: Database;
    private container: Container;
    private iotService: IoTService = new IoTService();
    private qotdService: QotdService = new QotdService();

    constructor() {
        this.database = database;
        this.container = this.database.container("offices");
    }

    async createOffice(office: Office): Promise<Office | null> {
        office.id = crypto.randomUUID();
        if (await this.iotService.createEnrollmentGroup(office.tenantId, office.name, office.id, office.wifiName, office.wifiPassword)) {
            const newOffice: Office = {
                id: office.id,
                tenantId: office.tenantId,
                name: office.name,
                wifiName: office.wifiName,
                wifiPassword: office.wifiPassword,
            }
            const { resource } = await this.container.items.create(newOffice);
            return resource as Office;
        }
        else return null;
    }

    async getOfficeByTenantId(id: string, tenantId: string): Promise<Office | null> {
        const { resource } = await this.container.item(id, tenantId).read();
        if (!resource) return null;
        return resource as Office;
    }

    async updateOffice(office: Office): Promise<Office | null> {
        if (await this.iotService.updateEnrollmentGroup(office.tenantId, office.name, office.id, office.wifiName, office.wifiPassword)) {
            const newOffice: Office = {
                id: office.id,
                tenantId: office.tenantId,
                name: office.name,
                wifiName: office.wifiName,
                wifiPassword: office.wifiPassword,
            }
            const { resource } = await this.container
                .item(office.id!, office.tenantId)
                .replace(newOffice);
            if (!resource) return null;
            return resource as Office;
        }
        else return null;
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
        await Promise.all(
            resources.map(async office => {
                office.deviceCount = await this.iotService.getDeviceCount(office.id!);
                office.qotdCount = await this.qotdService.getQotdsUntilToday(office.id!);
            })
        );
        return resources as Office[];
    }
}
