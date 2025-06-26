import { IoTService } from '../services/iotService';

jest.mock('azure-iot-provisioning-service', () => ({
    ProvisioningServiceClient: { fromConnectionString: jest.fn().mockReturnValue({ createOrUpdateEnrollmentGroup: jest.fn(), getEnrollmentGroup: jest.fn().mockResolvedValue({ responseBody: { initialTwin: { tags: { version: 1, count: 3, metadata: { lastUpdatedVersion: 1 } }, properties: { desired: { version: 1, metadata: { lastUpdatedVersion: 1 } } } } } }) }) }
}));

jest.mock('azure-iothub', () => ({ Registry: { fromConnectionString: jest.fn().mockReturnValue({ createQuery: jest.fn().mockReturnValue({ hasMoreResults: false, nextAsTwin: jest.fn().mockResolvedValue({ result: [] }) }) }) } }));

jest.mock('../db/db', () => require('./mockDb'));

describe('IoTService', () => {
    let iotService: IoTService;
    beforeEach(() => {
        iotService = new IoTService();
    });

    it('should instantiate', () => {
        expect(iotService).toBeDefined();
    });

    it('should return false on createEnrollmentGroup error', async () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        (iotService as any).provisioningServiceClient.createOrUpdateEnrollmentGroup = jest.fn().mockRejectedValue(new Error('fail'));
        const result = await iotService.createEnrollmentGroup('t','o','o','w','p');
        expect(result).toBe(false);
        errorSpy.mockRestore();
    });

    it('should return a number for getDeviceCount', async () => {
        const result = await iotService.getDeviceCount('office1');
        expect(typeof result).toBe('number');
    });

    it('should handle error in getDeviceCount', async () => {
        const orig = (iotService as any).provisioningServiceClient;
        (iotService as any).provisioningServiceClient = undefined;
        await expect(iotService.getDeviceCount('office1')).resolves.toBe(0);
        (iotService as any).provisioningServiceClient = orig;
    });

    it('should handle error in updateEnrollmentGroup', async () => {
        (iotService as any).provisioningServiceClient.getEnrollmentGroup = jest.fn().mockRejectedValue(new Error('fail'));
        const result = await iotService.updateEnrollmentGroup('t','o','o','w','p',[]);
        expect(result).toBe(false);
    });
});
