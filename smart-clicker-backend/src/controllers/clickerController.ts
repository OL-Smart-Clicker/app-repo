import express, { Request, Response } from 'express';
import { ClickerService } from '../services/clickerService';
import authorize from '../auth/verifyToken';

const router = express.Router();
const clickerService = new ClickerService();

router.get('/',
    // authorize([]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const response = await clickerService.getClickerData();
            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error!", error: error });
        }
    }
);

export default router;