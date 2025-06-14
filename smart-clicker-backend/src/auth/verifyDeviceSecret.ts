import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

const deviceSecret = process.env.DEVICE_SECRET;

function authorizeDevice() {
    return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers['authorization'];
            const secret = authHeader && authHeader.split(' ')[1];

            if (!secret || secret !== deviceSecret) {
                res.status(401).send({ error: 'UNAUTHORIZED' });
                return;
            }
            next();
        } catch (error) {
            console.error("Authorization error:", error);
            res.status(401).send({ error: 'UNAUTHORIZED' });
        }
    };
}

export default authorizeDevice;