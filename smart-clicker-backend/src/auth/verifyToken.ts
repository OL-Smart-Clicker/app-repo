import jwt, { JwtPayload } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import dotenv from 'dotenv';
import express from 'express';
import { RoleService } from '../services/roleService';
import { Permission } from '../models/permission';
import { calculateBitmask } from '../utils/calculateBitmask';
import { OfficeService } from '../services/officeService';

dotenv.config();
const roleService = new RoleService();
const officeService = new OfficeService();

function authorize(requiredPermissions: Permission[]) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                res.status(401).send({ error: 'UNAUTHORIZED' });
                return;
            }

            const decodedToken = jwt.decode(token, { complete: true });

            if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
                res.status(401).send({ error: 'UNAUTHORIZED' });
                return;
            }

            const client = new JwksClient({
                jwksUri: `${process.env.AUTHORITY}/discovery/v2.0/keys`
            });

            const key = await client.getSigningKey(decodedToken.header.kid);
            const signingKey = key.getPublicKey();

            const payload = jwt.verify(token, signingKey, {
                audience: process.env.CLIENT_ID,
                issuer: `${process.env.ISSUER_VERIFICATION}${process.env.TENANT_ID}/`,
                algorithms: ['RS256'],
            }) as JwtPayload;

            if (!payload || !payload.oid) {
                res.status(401).send({ error: 'UNAUTHORIZED' });
                return;
            }

            const userId = payload.oid;
            const userTenantId = payload.tid;
            const role = await roleService.getUserRole(userId, userTenantId);
            if (!role) {
                res.status(401).send({ error: 'UNAUTHORIZED' });
                return;
            }

            const officeSpaceId = req.params.officeSpaceId || req.body.officeSpaceId;
            if (officeSpaceId) {
                const office = await officeService.getOfficeByTenantId(officeSpaceId, userTenantId);
                if (!officeSpaceId || !office) {
                    res.status(401).send({ error: 'UNAUTHORIZED' });
                    return;
                }
            }

            const requiredBitmask = calculateBitmask(requiredPermissions);
            const userPermissionsBitmask = role.permissions;

            if ((userPermissionsBitmask & requiredBitmask) !== requiredBitmask) {
                res.status(403).send({ error: 'FORBIDDEN' });
                return;
            }

            (req as any).userId = userId;
            (req as any).tenantId = payload.tid;

            next();
        } catch (error) {
            console.error("Authorization error:", error);
            res.status(401).send({ error: 'UNAUTHORIZED' });
        }
    };
}

export default authorize;