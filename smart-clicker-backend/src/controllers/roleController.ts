import express, { Request, Response } from 'express';
import { RoleService } from '../services/roleService';
import authorize from '../auth/verifyToken';

const router = express.Router();
const roleService = new RoleService();

router.get('/:id',
    authorize([]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            if (!id) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            const roleId = await roleService.getUserRole(id);
            if (!roleId) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            const response = await roleService.getRoleById(roleId);
            res.status(200).send(response);
            res.status(200).send({ message: "Role found!" });
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error getting role!" });
        }
    }
);

export default router;