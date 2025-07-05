import express, { Request, Response } from 'express';
import { OfficeService } from '../services/officeService';
import authorize from '../auth/verifyToken';
import { Permission } from '../models/permission';
import multer from 'multer';
import { Office } from '../models/office';

const router = express.Router();
const officeService = new OfficeService();
const upload = multer();

// Get all offices
router.get('/',
    authorize([Permission.OfficeView]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const tenantId = (req as any).tenantId;

            if (!tenantId) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            const response = await officeService.getOfficesForTenant(tenantId);
            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error getting offices!" });
        }
    }
);

// Create a new office for the current tenant
router.post('/',
    authorize([Permission.OfficeCreate]),
    upload.single('floorPlan'),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, wifiName, wifiPassword } = req.body;
            const tenantId = (req as any).tenantId;

            if (!name || !tenantId || !wifiName || !req.file || !req.file.mimetype.startsWith('image/')) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            const officeData: Office = {
                name,
                wifiName,
                wifiPassword,
                tenantId
            };

            const response = await officeService.createOffice(officeData, req.file.buffer, req.file.mimetype);
            if (!response) {
                res.status(500).send({ error: "Error creating office!" });
                return;
            }
            res.status(201).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error creating office!" });
        }
    }
);

// Update an office for the current tenant
router.put('/:id',
    authorize([Permission.OfficeUpdate]),
    upload.single('floorPlan'),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const { name, wifiName, wifiPassword, anchors, scale } = req.body;
            const tenantId = (req as any).tenantId;

            if (!id || !tenantId || !name || !wifiName || !req.file || !req.file.mimetype.startsWith('image/')) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            const officeData: Office = {
                id,
                name,
                wifiName,
                wifiPassword,
                tenantId,
                anchors: anchors ? JSON.parse(anchors) : [],
                scale: scale ? parseFloat(scale) : undefined
            };

            const response = await officeService.updateOffice(officeData, req.file.buffer, req.file.mimetype);
            if (!response) {
                res.status(404).send({ error: "Office not found" });
                return;
            }

            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error updating office!" });
        }
    }
);

router.put('/:id/anchors',
    authorize([Permission.OfficeUpdate]),
    upload.none(),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const { anchors, scale } = req.body;
            const tenantId = (req as any).tenantId;

            if (!id || !tenantId || !anchors || !scale) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            const officeData = {
                id,
                tenantId,
                anchors: JSON.parse(anchors),
                scale: parseFloat(scale)
            };

            const response = await officeService.updateOfficeAnchors(officeData);
            if (!response) {
                res.status(404).send({ error: "Office not found" });
                return;
            }

            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error updating office anchors!" });
        }
    }
);

export default router;