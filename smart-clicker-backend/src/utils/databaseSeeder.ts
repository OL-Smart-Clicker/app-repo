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

    await rolesContainer.items.create(role);

    await userRolesContainer.items.create({
        userId: process.env.ADMIN_USER_ID!,
        roleId: roleId
    });

}