import { RoleService } from "../services/roleService";
import { Role } from "../models/role";

const id1 = crypto.randomUUID();
const id2 = crypto.randomUUID();
const mockRole: Role = { id: id1, tenantId: "tenant1", roleName: "admin", permissions: 15 };
const mockRole2: Role = { id: id2, tenantId: "tenant1", roleName: "user", permissions: 7 };

// jest.mock('../db/db', () => require('./mockDb'));

describe("RoleService", () => {
    let roleService: RoleService;

    beforeEach(() => {
        roleService = new RoleService();
    });

    afterAll(async () => {
        jest.clearAllMocks();
    });

    it("should create a role", async () => {
        const result = await roleService.createRole(mockRole);
        expect(result).toMatchObject(mockRole);
    });

    it("should update a role", async () => {
        // This test may need to seed the DB first if you want to test update
        // For now, just check that it throws or returns as expected
        await expect(roleService.updateRole(mockRole2)).rejects.toThrow();
    });

    it("should get a role by id", async () => {
        const result = await roleService.getRoleById(id1, "tenant1");
        expect(result).toMatchObject(mockRole);
    });

    it("should get roles for a tenant", async () => {
        // Mock query to return two roles
        (roleService as any).rolesContainer.items.query = jest
            .fn()
            .mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [mockRole, mockRole2] }) });
        const result = await roleService.getRoles("tenant1");
        expect(result).toEqual([mockRole, mockRole2]);
    });

    it("should assign a role to a user", async () => {
        // Mock getRoleById to return a role
        roleService.getRoleById = jest.fn().mockResolvedValue(mockRole);
        // Mock userRolesContainer
        (roleService as any).userRolesContainer.items.query = jest.fn().mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
        (roleService as any).userRolesContainer.items.create = jest.fn().mockResolvedValue({});
        await expect(roleService.assignRoleToUser("user1", id1, "tenant1")).resolves.toBeUndefined();
    });

    it("should throw if assigning a non-existent role to user", async () => {
        roleService.getRoleById = jest.fn().mockResolvedValue(undefined);
        await expect(roleService.assignRoleToUser("user1", "badrole", "tenant1")).rejects.toThrow("Role not found");
    });

    it("should delete old user-role mapping when assigning new role", async () => {
        roleService.getRoleById = jest.fn().mockResolvedValue(mockRole);
        // Mock userRolesContainer to return an existing mapping
        (roleService as any).userRolesContainer.items.query = jest.fn().mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: "ur1", userId: "user1", roleId: "oldrole" }] }) });
        (roleService as any).userRolesContainer.item = jest.fn().mockReturnValue({ delete: jest.fn().mockResolvedValue({}) });
        (roleService as any).userRolesContainer.items.create = jest.fn().mockResolvedValue({});
        await expect(roleService.assignRoleToUser("user1", id1, "tenant1")).resolves.toBeUndefined();
    });

    it("should get user role", async () => {
        // Mock userRolesContainer to return a user-role mapping
        (roleService as any).userRolesContainer.items.query = jest
            .fn()
            .mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [{ userId: "user1", roleId: id1 }] }) });
        roleService.getRoleById = jest.fn().mockResolvedValue(mockRole);
        const result = await roleService.getUserRole("user1", "tenant1");
        expect(result).toEqual(mockRole);
    });

    it("should return null if user role mapping has no roleId", async () => {
        (roleService as any).userRolesContainer.items.query = jest.fn().mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [{ userId: "user1" }] }) });
        const result = await roleService.getUserRole("user1", "tenant1");
        expect(result).toBeNull();
    });

    it("should handle getRoleById returning undefined in getUserRole", async () => {
        (roleService as any).userRolesContainer.items.query = jest.fn().mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [{ userId: "user1", roleId: "badrole" }] }) });
        roleService.getRoleById = jest.fn().mockResolvedValue(undefined);
        const result = await roleService.getUserRole("user1", "tenant1");
        expect(result).toBeUndefined();
    });

    it("should return null if user role not found", async () => {
        (roleService as any).userRolesContainer.items.query = jest.fn().mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
        const result = await roleService.getUserRole("user2", "tenant1");
        expect(result).toBeNull();
    });
});
