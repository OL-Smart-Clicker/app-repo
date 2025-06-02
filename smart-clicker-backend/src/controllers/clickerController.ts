import express, { Request, Response } from 'express';
import { ClickerService } from '../services/clickerService';
import authorize from '../auth/verifyToken';
import { Permission } from '../models/permission';

const router = express.Router();
const clickerService = new ClickerService();

router.get('/:officeSpaceId',
    authorize([Permission.DataView]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const officeSpaceId = req.params.officeSpaceId;
            if (!officeSpaceId) {
                res.status(400).send({ message: "BAD REQUEST" });
                return;
            }
            const response = await clickerService.getClickerData(officeSpaceId);
            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error!", error: error });
        }
    }
);

export default router;