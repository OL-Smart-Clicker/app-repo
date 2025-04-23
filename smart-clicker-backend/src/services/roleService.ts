import { Database } from "@azure/cosmos";
import database from "../db/db";
import { Role } from "../models/role"

export class RoleService {
    private database: Database;

    constructor() {
        this.database = database;
    }

    async getUserRole(id: string): Promise<string> {
        const userContainer = this.database.container("UsersRoles");
        const userQuerySpec = {
            query: 'SELECT * FROM UsersRoles u WHERE u.UserId = @userId',
            parameters: [
                {
                    name: '@userId',
                    value: id
                }
            ]
        };
        const { resources } = await userContainer.items.query(userQuerySpec).fetchAll();
        if (resources.length === 0) return '';
        if (resources[0].RoleId === undefined) return '';
        return resources[0].RoleId;
    }

    async getRoleById(id: string): Promise<Role> {
        const container = this.database.container("Roles");
        const querySpec = {
            query: 'SELECT * FROM Roles r WHERE r.id = @roleId',
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

    async testMethod(): Promise<any> {
        const container = this.database.container("clicker-data");
        const querySpec = {
            query: 'SELECT * FROM c'
        };
        const { resources } = await container.items.query(querySpec).fetchAll();
        return resources;
    }
}