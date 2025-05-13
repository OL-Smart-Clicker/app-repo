import { Database } from "@azure/cosmos";
import database from "../db/db";
import { Role } from "../models/role"

export class RoleService {
    private database: Database;

    constructor() {
        this.database = database;
    }

    async getUserRole(id: string): Promise<string> {
        const userContainer = this.database.container("users-roles");
        const userQuerySpec = {
            query: 'SELECT * FROM c WHERE u.userId = @userId',
            parameters: [
                {
                    name: '@userId',
                    value: id
                }
            ]
        };
        const { resources } = await userContainer.items.query(userQuerySpec).fetchAll();
        if (resources.length === 0) return '';
        if (resources[0].roleId === undefined) return '';
        return resources[0].roleId;
    }

    async getRoleById(id: string): Promise<Role> {
        const container = this.database.container("roles");
        const querySpec = {
            query: 'SELECT * FROM c WHERE r.id = @roleId',
            parameters: [
                {
                    name: '@roleId',
                    value: id
                }
            ]
        };
        const { resources } = await container.items.query(querySpec).fetchAll();
        return resources[0] as Role;
    }
}