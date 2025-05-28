import { Container, Database } from "@azure/cosmos";
import database from "../db/db";
import { Role } from "../models/role";

export class RoleService {
  private database: Database;
  private userRolesContainer: Container;
  private rolesContainer: Container;

  constructor() {
    this.database = database;
    this.userRolesContainer = this.database.container("users-roles");
    this.rolesContainer = this.database.container("roles");
  }

  async getUserRole(id: string): Promise<string> {
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
    if (resources.length === 0) return "";
    if (resources[0].roleId === undefined) return "";
    return resources[0].roleId;
  }

  async getRoleById(id: string): Promise<Role> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @roleId",
      parameters: [
        {
          name: "@roleId",
          value: id,
        },
      ],
    };
    const { resources } = await this.rolesContainer.items
      .query(querySpec)
      .fetchAll();
    return resources[0] as Role;
  }
}
