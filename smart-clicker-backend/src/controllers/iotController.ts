import express, { Request, Response } from 'express';
import authorizeDevice from '../auth/verifyDeviceSecret';
import { IoTService } from '../services/iotService';

const router = express.Router();
const iotService = new IoTService();

// Return derived device key
router.post('/',
    authorizeDevice(),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { groupId, deviceRegistrationId } = req.body;

            if (!groupId || !deviceRegistrationId) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            const deviceKey = await iotService.deriveDeviceKey(groupId, deviceRegistrationId);
            if (!deviceKey) {
                res.status(500).send({ error: "Error deriving device key!" });
                return;
            }
            res.status(200).send(deviceKey);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error deriving device key!" });
        }
    }
);

export default router;