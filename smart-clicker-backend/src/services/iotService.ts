import { ProvisioningServiceClient } from 'azure-iot-provisioning-service';
import { EnrollmentGroup } from 'azure-iot-provisioning-service/dist/interfaces';
import { Registry } from 'azure-iothub';
import dotenv from 'dotenv';
import { createHmac } from 'crypto';
dotenv.config();

export class IoTService {

    private provisioningServiceClient: ProvisioningServiceClient;

    constructor() {
        this.provisioningServiceClient = ProvisioningServiceClient.fromConnectionString(process.env.DPS_CONNECTION_STRING!);
    }

    private generateBase64Key(): string {
        const array = new Uint8Array(32); // 32 bytes = 256 bits
        crypto.getRandomValues(array);
        // Convert to base64
        // First, to string
        let binary = '';
        for (let i = 0; i < array.length; i++) {
            binary += String.fromCharCode(array[i]);
        }
        // Then, base64 encode
        return btoa(binary);
    }

    async deriveDeviceKey(groupId: string, deviceRegistrationId: string): Promise<string> {
        const enrollmentGroup = (await this.provisioningServiceClient.getEnrollmentGroupAttestationMechanism(groupId)).responseBody;

        if (!enrollmentGroup.symmetricKey) {
            throw new Error('Enrollment group does not have a symmetric key');
        }

        const enrollmentGroupKeyB64 = enrollmentGroup.symmetricKey.primaryKey;
        const groupKey = Buffer.from(enrollmentGroupKeyB64, 'base64');
        const hmac = createHmac('sha256', groupKey);
        hmac.update(deviceRegistrationId, 'utf8');
        const deviceKey = hmac.digest();
        return deviceKey.toString('base64');
    }

    async createEnrollmentGroup(tenantId: string, officeName: string, officeId: string, wifiName: string, wifiPassword: string): Promise<boolean> {
        try {
            const primaryKey = this.generateBase64Key();
            const secondaryKey = this.generateBase64Key();

            const enrollmentGroup: EnrollmentGroup = {
                enrollmentGroupId: officeId,
                iotHubHostName: process.env.IOTHUB_HOSTNAME,
                provisioningStatus: 'enabled',
                initialTwin: {
                    tags: {
                        version: 1,
                        count: 3,
                        metadata: {
                            lastUpdated: new Date(),
                            lastUpdatedVersion: 1
                        },
                        tenantId: tenantId,
                        officeId: officeId,
                        officeName: officeName
                    },
                    properties: {
                        desired: {
                            wifiName: wifiName,
                            wifiPassword: wifiPassword,
                            version: 1,
                            count: 2,
                            metadata: {
                                lastUpdated: new Date(),
                                lastUpdatedVersion: 1
                            }
                        }
                    }
                },
                attestation: {
                    type: 'symmetricKey',
                    symmetricKey: {
                        primaryKey: primaryKey,
                        secondaryKey: secondaryKey
                    }
                },
                capabilities: {
                    iotEdge: false
                }
            };

            const result = await this.provisioningServiceClient.createOrUpdateEnrollmentGroup(enrollmentGroup);
            if (!result) return false;
            return true;
        } catch (error) {
            console.error('Error creating enrollment group:', error);
            return false;
        }
    }

    async updateEnrollmentGroup(tenantId: string, officeName: string, officeId: string, wifiName: string, wifiPassword: string): Promise<boolean> {
        try {
            const response = await this.provisioningServiceClient.getEnrollmentGroup(officeId);
            const currentEnrollmentGroup = response.responseBody;
            const currentTwin = currentEnrollmentGroup.initialTwin;

            if (!currentTwin) {
                console.error('Current twin not found');
                return false;
            }

            const newTwin = {
                tags: {
                    version: currentTwin.tags.version + 1,
                    count: currentTwin.tags.count,
                    metadata: {
                        lastUpdated: new Date(),
                        lastUpdatedVersion: currentTwin.tags.metadata.lastUpdatedVersion + 1
                    },
                    tenantId: tenantId,
                    officeId: officeId,
                    officeName: officeName
                },
                properties: {
                    desired: {
                        wifiName: wifiName,
                        wifiPassword: wifiPassword,
                        version: currentTwin.properties.desired.version + 1,
                        count: 2,
                        metadata: {
                            lastUpdated: new Date(),
                            lastUpdatedVersion: currentTwin.properties.desired.metadata.lastUpdatedVersion + 1
                        }
                    }
                }
            }

            currentEnrollmentGroup.initialTwin = newTwin;

            const result = await this.provisioningServiceClient.createOrUpdateEnrollmentGroup(currentEnrollmentGroup);
            if (!result) return false;
            return true;
        } catch (error) {
            console.error('Error creating enrollment group:', error);
            return false;
        }
    }

    async getDeviceCount(officeId: string): Promise<number> {
        try {
            const registry = Registry.fromConnectionString(process.env.IOTHUB_CONNECTION_STRING!);
            const query = registry.createQuery(
                `SELECT * FROM devices WHERE tags.officeId = '${officeId}'`, 100
            );
            let count = 0;
            while (query.hasMoreResults) {
                const result = await query.nextAsTwin();
                count += result.result.length;
            }
            return count;
        } catch (error) {
            console.error('Error getting device count:', error);
            return 0;
        }
    }
}
