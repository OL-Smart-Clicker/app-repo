jest.mock('../db/db', () => ({
    container: jest.fn().mockReturnValue({
        items: {
            query: jest.fn().mockReturnValue({
                fetchAll: jest.fn().mockResolvedValue({ resources: [] })
            })
        },
        item: jest.fn().mockReturnValue({
            read: jest.fn().mockResolvedValue({ resource: null }),
            replace: jest.fn().mockResolvedValue({ resource: null })
        })
    })
}));

import { OfficeService } from '../services/officeService';

describe('OfficeService', () => {
    let officeService: OfficeService;
    beforeEach(() => {
        officeService = new OfficeService();
        (officeService as any).iotService.createEnrollmentGroup = jest.fn().mockResolvedValue(false);
    });

    it('should instantiate', () => {
        expect(officeService).toBeDefined();
    });

    it('should return null if createEnrollmentGroup fails', async () => {
        const result = await officeService.createOffice({ id: '', tenantId: '', name: '', wifiName: '', wifiPassword: '' } as any, Buffer.from(''), 'image/png');
        expect(result).toBeNull();
    });

    it('should getOfficeByTenantId return null if not found', async () => {
        const result = await officeService.getOfficeByTenantId('id','tenant');
        expect(result).toBeNull();
    });

    it('should updateOffice return null if updateEnrollmentGroup fails', async () => {
        (officeService as any).iotService.updateEnrollmentGroup = jest.fn().mockResolvedValue(false);
        const result = await officeService.updateOffice({ id: '', tenantId: '', name: '', wifiName: '', wifiPassword: '' } as any, Buffer.from(''), 'image/png');
        expect(result).toBeNull();
    });

    it('should updateOfficeAnchors return null if updateEnrollmentGroup fails', async () => {
        (officeService as any).iotService.updateEnrollmentGroup = jest.fn().mockResolvedValue(false);
        (officeService as any).container.item = jest.fn().mockReturnValue({ read: jest.fn().mockResolvedValue({ resource: { tenantId: '', name: '', id: '', wifiName: '', wifiPassword: '' } }) });
        const result = await officeService.updateOfficeAnchors({ id: '', tenantId: '', anchors: [], scale: 1 });
        expect(result).toBeNull();
    });

    it('should getOfficesForTenant return array', async () => {
        (officeService as any).blobService.getFloorPlan = jest.fn().mockResolvedValue({ base64: 'abc', contentType: 'image/png' });
        (officeService as any).iotService.getDeviceCount = jest.fn().mockResolvedValue(2);
        (officeService as any).qotdService.getQotdsUntilToday = jest.fn().mockResolvedValue(3);
        const result = await officeService.getOfficesForTenant('tenant');
        expect(Array.isArray(result)).toBe(true);
    });
});
