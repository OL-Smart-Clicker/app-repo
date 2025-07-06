export type Office = {
    id?: string;
    tenantId: string;
    name: string;
    wifiName: string;
    wifiPassword: string;
    floorPlan?: string;
    anchors?: { id: number, x: number, y: number }[];
    deviceCount?: number;
    qotdCount?: number;
    scale?: number; // grid size in px per meter
    primaryKey?: string; // for Azure DPS
}