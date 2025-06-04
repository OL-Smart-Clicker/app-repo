import express, { Request, Response } from 'express';
import { UserService } from '../services/userService';
import authorize from '../auth/verifyToken';
import { Permission } from '../models/permission';

const router = express.Router();
const userService = new UserService();

// Get all users
router.get('/',
    authorize([Permission.RolesAssign]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const tenantId = (req as any).tenantId;
            
            if (!tenantId) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }
            
            const response = await userService.getUsers(tenantId);
            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error getting users!" });
        }
    }
);

export default router;