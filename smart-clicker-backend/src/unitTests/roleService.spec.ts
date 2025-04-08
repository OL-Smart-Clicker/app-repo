import mockDatabase from "./mockDb";
import { RoleService } from "../services/roleService";
import { Role } from "../models/role";

const mockDb = mockDatabase;
let roleService: RoleService;
const mockRole: Role = { id: "123", RoleId: "123", RoleName: "admin", Permissions: 15 };

describe("RoleService", () => {
    beforeAll(async () => {
        roleService = new RoleService();
        (roleService as any).database = mockDb;
        await mockDb.container("Roles").items.create(mockRole);
        await mockDb.container("UsersRoles").items.create({ UserId: "123", RoleId: "123" });
    })

    afterAll(async () => {
        jest.clearAllMocks();
    });

    describe("getUserRole", () => {
        it("should return the user's role ID when found", async () => {
            const mockUserId = "123";
            const roleId = await roleService.getUserRole(mockUserId);
            expect(roleId).toBe(mockRole.RoleId);
        });

        it("should return an empty string if user role is not found", async () => {
            const mockUserId = "1234";
            const roleId = await roleService.getUserRole(mockUserId);
            expect(roleId).toBe('');
        });

    });

    describe("getRoleById", () => {
        it("should return the role when found", async () => {
            const mockRoleId = "123";
            const role = await roleService.getRoleById(mockRoleId);
            expect(role).toEqual(mockRole);
        });

        it("should return undefined if role is not found", async () => {
            const mockRoleId = "1234";
            const role = await roleService.getRoleById(mockRoleId);
            expect(role).toBeUndefined();
        });
    });
});
