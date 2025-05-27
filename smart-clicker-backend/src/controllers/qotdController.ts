import express, { Request, Response } from "express";
import { QotdService } from "../services/qotdService";
import authorize from "../auth/verifyToken";
import { Permission } from "../models/permission";

const router = express.Router();
const qotdService = new QotdService();

// Create a new QOTD
router.post(
  "/",
  authorize([Permission.QuestionSet]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const qotd = req.body;
      const created = await qotdService.createQotd(qotd);
      res.status(201).send(created);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error creating QOTD", error });
    }
  }
);

// Get all QOTDs for an office
router.get(
  "/office/:officeSpaceId",
  authorize([Permission.QuestionViewAll]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const officeSpaceId = req.params.officeSpaceId;
      if (!officeSpaceId) {
        res.status(400).send({ error: "BAD REQUEST" });
        return;
      }
      const qotds = await qotdService.getQotdsForOffice(officeSpaceId);
      res.status(200).send(qotds);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error fetching QOTDs", error });
    }
  }
);

// Get today's QOTD for an office
router.get(
  "/office/:officeSpaceId/today",
  authorize([Permission.QuestionViewToday]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const officeSpaceId = req.params.officeSpaceId;
      if (!officeSpaceId) {
        res.status(400).send({ error: "BAD REQUEST" });
        return;
      }
      const qotd = await qotdService.getQotdTodayForOffice(officeSpaceId);
      if (!qotd) {
        res.status(404).send({ message: "No QOTD found for today" });
        return;
      }
      res.status(200).send(qotd);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error fetching today's QOTD", error });
    }
  }
);

// Get a QOTD by ID and officeSpaceId
router.get(
  "/:id/office/:officeSpaceId",
  authorize([Permission.QuestionViewAll]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const officeSpaceId = req.params.officeSpaceId;
      if (!officeSpaceId || !id) {
        res.status(400).send({ error: "BAD REQUEST" });
        return;
      }
      const qotd = await qotdService.getQotdById(id, officeSpaceId);
      if (!qotd) {
        res.status(404).send({ message: "QOTD not found" });
        return;
      }
      res.status(200).send(qotd);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error fetching QOTD", error });
    }
  }
);

// Delete a QOTD
router.delete(
  "/:id/office/:officeSpaceId",
  authorize([Permission.QuestionDelete]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const officeSpaceId = req.params.officeSpaceId;
      if (!officeSpaceId || !id) {
        res.status(400).send({ error: "BAD REQUEST" });
        return;
      }
      await qotdService.deleteQotd(id, officeSpaceId);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error deleting QOTD", error });
    }
  }
);

// Update a QOTD
router.put(
  "/:id/office/:officeSpaceId",
  authorize([Permission.QuestionEdit]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const officeSpaceId = req.params.officeSpaceId;
      const qotd = req.body;
      if (
        !officeSpaceId ||
        !id ||
        id !== qotd.id ||
        officeSpaceId !== qotd.officeSpaceId
      ) {
        res.status(400).send({ error: "BAD REQUEST" });
        return;
      }
      const updated = await qotdService.updateQotd(qotd);
      if (!updated) {
        res.status(404).send({ message: "QOTD not found" });
        return;
      }
      res.status(200).send(updated);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error updating QOTD", error });
    }
  }
);

export default router;
