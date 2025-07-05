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
            const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
            const csv = req.query.csv ? req.query.csv === 'true' : false;
            if (!officeSpaceId || !startDate || !endDate) {
                res.status(400).send({ message: "BAD REQUEST" });
                return;
            }
            if (csv) {
                const response = await clickerService.exportClickerDataByDateCSV(officeSpaceId, startDate, endDate);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=clicker_data_${officeSpaceId}_${startDate.toISOString()}_${endDate.toISOString()}.csv`);
                res.status(200).send(response);
            }
            else {
                const response = await clickerService.getClickerDataByDate(officeSpaceId, startDate, endDate);
                res.status(200).send(response);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error!", error: error });
        }
    }
);

router.get('/:officeSpaceId/all',
    authorize([Permission.DataView]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const officeSpaceId = req.params.officeSpaceId;
            if (!officeSpaceId) {
                res.status(400).send({ message: "BAD REQUEST" });
                return;
            }
            const response = await clickerService.getClicksAll(officeSpaceId);
            res.status(200).send(JSON.stringify(response));
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error!", error: error });
        }
    }
);

router.get('/:officeSpaceId/week',
    authorize([Permission.DataView]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const officeSpaceId = req.params.officeSpaceId;
            if (!officeSpaceId) {
                res.status(400).send({ message: "BAD REQUEST" });
                return;
            }
            const response = await clickerService.getClicksWeek(officeSpaceId);
            res.status(200).send(JSON.stringify(response));
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Error!", error: error });
        }
    }
);

export default router;