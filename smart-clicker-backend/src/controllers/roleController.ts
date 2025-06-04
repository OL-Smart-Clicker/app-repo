import express, { Request, Response } from 'express';
import { RoleService } from '../services/roleService';
import authorize from '../auth/verifyToken';
import { Permission } from '../models/permission';

const router = express.Router();
const roleService = new RoleService();

// Get all roles
router.get('/',
    authorize([Permission.RolesView]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const tenantId = (req as any).tenantId;
            
            if (!tenantId) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }
            
            const response = await roleService.getRoles(tenantId);
            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error getting roles!" });
        }
    }
);

// Get current user's role
router.get('/self',
    authorize([]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).userId;
            const tenantId = (req as any).tenantId;
            if (!userId) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            const role = await roleService.getUserRole(userId, tenantId);
            if (!role) {
                res.status(404).send({ error: "No role assigned to user" });
                return;
            }
            res.status(200).send(role);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error getting user role!" });
        }
    }
);

// Create a new role
router.post('/',
    authorize([Permission.RolesCreate]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const roleData = req.body;
            if (!roleData.roleName || roleData.permissions === undefined) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            const response = await roleService.createRole(roleData);
            res.status(201).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error creating role!" });
        }
    }
);

// Update a role
router.put('/:id',
    authorize([Permission.RolesUpdate]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const roleData = req.body;

            if (!id) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            if (!roleData.roleName || roleData.permissions === undefined) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            roleData.id = id;
            const response = await roleService.updateRole(roleData);
            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error updating role!" });
        }
    }
);

// Assign role to user
router.post('/assign',
    authorize([Permission.RolesAssign]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId, roleId } = req.body;
            const tenantId = (req as any).tenantId;

            if (!userId || !roleId || !tenantId) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            await roleService.assignRoleToUser(userId, roleId, tenantId);
            res.status(200).send({ message: "Role assigned successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error assigning role!" });
        }
    }
);

export default router;