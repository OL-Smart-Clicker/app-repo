import express, { Request, Response } from 'express';
import { OfficeService } from '../services/officeService';
import authorize from '../auth/verifyToken';
import { Permission } from '../models/permission';

const router = express.Router();
const officeService = new OfficeService();

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

// Get office by ID for the current tenant
router.get('/:id',
    authorize([Permission.OfficeView]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const tenantId = (req as any).tenantId;

            if (!id || !tenantId) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            const response = await officeService.getOfficeByTenantId(id, tenantId);
            if (!response) {
                res.status(404).send({ error: "Office not found" });
                return;
            }

            res.status(200).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error getting office!" });
        }
    }
);

// Create a new office for the current tenant
router.post('/',
    authorize([Permission.OfficeCreate]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const officeData = req.body;
            const tenantId = (req as any).tenantId;

            if (!officeData.name || !tenantId) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            // Set the tenant ID for the new office
            officeData.tenantId = tenantId;

            const response = await officeService.createOffice(officeData);
            res.status(201).send(response);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: "Error creating office!" });
        }
    }
);

// Update an office for the current tenant
router.put('/:id',
    authorize([Permission.OfficeUpdate]), // Using RolesEdit as a proxy for admin permissions
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const officeData = req.body;
            const tenantId = (req as any).tenantId;

            if (!id || !tenantId) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            if (!officeData.name) {
                res.status(400).send({ error: "BAD REQUEST" });
                return;
            }

            // Ensure the office belongs to the current tenant
            officeData.id = id;
            officeData.tenantId = tenantId;

            const response = await officeService.updateOffice(officeData);
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

export default router;