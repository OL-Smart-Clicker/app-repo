import { Permission } from "../models/permission";

export function calculateBitmask(permissions: Permission[]): number {
    return permissions.reduce((bitmask, permission) => bitmask | permission, 0);
}