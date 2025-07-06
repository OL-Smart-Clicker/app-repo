import { Database, Container } from "@azure/cosmos";
import database from "../db/db";
import { Office } from "../models/office";
import { IoTService } from "./iotService";
import { QotdService } from "./qotdService";
import { BlobService } from "./blobService";

export class OfficeService {
    private database: Database;
    private container: Container;
    private iotService: IoTService = new IoTService();
    private qotdService: QotdService = new QotdService();
    private blobService: BlobService = new BlobService();

    constructor() {
        this.database = database;
        this.container = this.database.container("offices");
    }

    async createOffice(office: Office, fileBuffer: Buffer, mimeType: string): Promise<Office | null> {
        office.id = crypto.randomUUID();
        const response = await this.iotService.createEnrollmentGroup(office.tenantId, office.name, office.id, office.wifiName, office.wifiPassword);
        if (response.result) {
            await this.blobService.uploadFloorPlan(office.id, fileBuffer, mimeType);
            const newOffice: Office = {
                id: office.id,
                tenantId: office.tenantId,
                name: office.name,
                wifiName: office.wifiName,
                wifiPassword: office.wifiPassword,
                primaryKey: response.primaryKey,
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

    async updateOffice(office: Office, fileBuffer: Buffer, mimeType: string): Promise<Office | null> {
        if (await this.iotService.updateEnrollmentGroup(office.tenantId, office.name, office.id!, office.wifiName, office.wifiPassword, office.anchors)) {
            await this.blobService.uploadFloorPlan(office.id!, fileBuffer, mimeType);
            const newOffice: Office = {
                id: office.id,
                tenantId: office.tenantId,
                name: office.name,
                wifiName: office.wifiName,
                wifiPassword: office.wifiPassword,
                anchors: office.anchors,
                scale: office.scale,
                primaryKey: office.primaryKey,
            }
            const { resource } = await this.container
                .item(office.id!, office.tenantId)
                .replace(newOffice);
            if (!resource) return null;
            return resource as Office;
        }
        else return null;
    }

    async updateOfficeAnchors(office: any): Promise<Office | null> {
        const { resource: oldOffice } = await this.container.item(office.id, office.tenantId).read();
        if (await this.iotService.updateEnrollmentGroup(oldOffice.tenantId, oldOffice.name, oldOffice.id!, oldOffice.wifiName, oldOffice.wifiPassword, office.anchors)) {
            const newOffice: Office = {
                id: office.id,
                tenantId: office.tenantId,
                name: oldOffice.name,
                wifiName: oldOffice.wifiName,
                wifiPassword: oldOffice.wifiPassword,
                floorPlan: oldOffice.floorPlan,
                anchors: office.anchors,
                scale: office.scale,
                primaryKey: oldOffice.primaryKey,
            }
            const { resource } = await this.container.item(office.id, office.tenantId).replace(newOffice);
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
            (resources as Office[]).map(async office => {
                const floorPlan = await this.blobService.getFloorPlan(office.id!);
                if (floorPlan) office.floorPlan = `data:${floorPlan?.contentType};base64,${floorPlan?.base64}`;
                office.deviceCount = await this.iotService.getDeviceCount(office.id!);
                office.qotdCount = await this.qotdService.getQotdsUntilToday(office.id!);
            })
        );
        return resources as Office[];
    }
}
