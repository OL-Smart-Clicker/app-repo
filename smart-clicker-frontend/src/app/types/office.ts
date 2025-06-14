export type Office = {
    id: string;
    tenantId: string;
    name: string;
    wifiName: string;
    wifiPassword: string;
    deviceCount?: number;
    qotdCount?: number;
}