import { Container, Database } from "@azure/cosmos";
import database from "../db/db";
import { Role } from "../models/role";
import { seedRoles } from "../utils/databaseSeeder";

export class RoleService {
  private database: Database;
  private userRolesContainer: Container;
  private rolesContainer: Container;

  constructor() {
    this.database = database;
    this.userRolesContainer = this.database.container("users-roles");
    this.rolesContainer = this.database.container("roles");
  }

  async init(): Promise<void> {
    // if (await this.getRolesCount() === 0) {
    await seedRoles();
    // }
  }

  private async getRolesCount(): Promise<number> {
    const { resources } = await this.userRolesContainer.items.readAll().fetchAll();
    return resources.length as number;
  }

  async getUserRole(id: string, tenantId: string): Promise<Role | null> {
    const userQuerySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId",
      parameters: [
        {
          name: "@userId",
          value: id,
        },
      ],
    };
    const { resources } = await this.userRolesContainer.items
      .query(userQuerySpec)
      .fetchAll();
    if (resources.length === 0) return null;
    if (resources[0].roleId === undefined) return null;
    return await this.getRoleById(resources[0].roleId, tenantId);
  }

  async getRoleById(id: string, tenantId: string): Promise<Role> {
    const { resource } = await this.rolesContainer.item(id, tenantId).read();
    return resource as Role;
  }


  async createRole(role: Role): Promise<Role> {
    const { resource } = await this.rolesContainer.items.create(role);
    return resource as Role;
  }
  async updateRole(role: Role): Promise<Role> {
    const { resource } = await this.rolesContainer.item(role.id!, role.tenantId).replace(role);
    return resource as Role;
  }

  async getRoles(tenantId: string): Promise<Role[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.tenantId = @tenantId",
      parameters: [
        {
          name: "@tenantId",
          value: tenantId,
        },
      ],
    };
    const { resources } = await this.rolesContainer.items.query(querySpec).fetchAll();
    return resources as Role[];
  }

  async assignRoleToUser(userId: string, roleId: string, tenantId: string): Promise<void> {
    const role = await this.getRoleById(roleId, tenantId);
    if (!role) {
      throw new Error("Role not found");
    }

    const querySpec = {
      query: 'SELECT * FROM c WHERE c.userId = @userId',
      parameters: [
        {
          name: '@userId',
          value: userId
        }
      ]
    };
    const { resources } = await this.userRolesContainer.items.query(querySpec).fetchAll();

    if (resources.length > 0) {
      await this.userRolesContainer.item(resources[0].id, resources[0].roleId).delete();
    }
    await this.userRolesContainer.items.create({ userId: userId, roleId: roleId });
  }
}
