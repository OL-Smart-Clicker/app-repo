import { Container, Database } from "@azure/cosmos";
import database from "../db/db";
import { Role } from "../models/role";
import dotenv from "dotenv";

dotenv.config();

export async function seedRoles() {
    const databaseInstance: Database = database;
    const rolesContainer: Container = databaseInstance.container("roles");
    const userRolesContainer: Container = databaseInstance.container("users-roles");

    const roleId = crypto.randomUUID();

    const role: Role = {
        id: roleId,
        tenantId: process.env.TENANT_ID!,
        roleName: "Admin",
        permissions: 4095,
    }

    const { resources } = await rolesContainer.items.readAll().fetchAll();

    await rolesContainer.item(resources[0].id!, resources[0].tenantId).delete();

    const { resources: userResources } = await userRolesContainer.items.readAll().fetchAll();

    await userRolesContainer.item(userResources[0].id!, userResources[0].roleId).delete();

    await rolesContainer.items.create(role);

    await userRolesContainer.items.create({
        userId: process.env.ADMIN_USER_ID!,
        roleId: roleId
    });

}