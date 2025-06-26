jest.mock('../db/db', () => require('./mockDb'));

import { QotdService } from '../services/qotdService';

describe('QotdService', () => {
    let qotdService: QotdService;
    beforeEach(() => {
        qotdService = new QotdService();
    });

    it('should instantiate', () => {
        expect(qotdService).toBeDefined();
    });

    it('should return null if getQotdById not found', async () => {
        const result = await qotdService.getQotdById('id','office');
        expect(result).toBeNull();
    });

    it('should createQotd return resource', async () => {
        (qotdService as any).container.items.create = jest.fn().mockResolvedValue({ resource: { id: '1' } });
        const result = await qotdService.createQotd({ id: '1' } as any);
        expect(result).toEqual({ id: '1' });
    });

    it('should getQotdsForOffice return array', async () => {
        (qotdService as any).container.items.query = jest.fn().mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [{ id: '1' }] }) });
        const result = await qotdService.getQotdsForOffice('office');
        expect(Array.isArray(result)).toBe(true);
    });

    it('should getQotdForOffice return null if not found', async () => {
        (qotdService as any).container.items.query = jest.fn().mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
        const result = await qotdService.getQotdForOffice('office', new Date());
        expect(result).toBeNull();
    });

    it('should deleteQotd call delete', async () => {
        (qotdService as any).container.item = jest.fn().mockReturnValue({ delete: jest.fn().mockResolvedValue({}) });
        await expect(qotdService.deleteQotd('id','office')).resolves.toBeUndefined();
    });

    it('should updateQotd return true if existingQotd exists', async () => {
        qotdService.getQotdForOffice = jest.fn().mockResolvedValue({});
        const result = await qotdService.updateQotd({ officeSpaceId: 'office', date: '2024-01-01' } as any);
        expect(result).toBe(true);
    });

    it('should getQotdsUntilToday return number', async () => {
        (qotdService as any).container.items.query = jest.fn().mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [1,2,3] }) });
        const result = await qotdService.getQotdsUntilToday('office');
        expect(result).toBe(3);
    });

    it('should handle error in getQotdById', async () => {
        (qotdService as any).container.item = jest.fn().mockReturnValue({ read: jest.fn().mockRejectedValue(new Error('Error')) });
        await expect(qotdService.getQotdById('id','office')).rejects.toThrow('Error');
    });

    it('should handle error in createQotd', async () => {
        (qotdService as any).container.items.create = jest.fn().mockRejectedValue(new Error('Error'));
        await expect(qotdService.createQotd({ id: '1' } as any)).rejects.toThrow('Error');
    });

    it('should handle error in getQotdsForOffice', async () => {
        (qotdService as any).container.items.query = jest.fn().mockReturnValue({ fetchAll: jest.fn().mockRejectedValue(new Error('Error')) });
        await expect(qotdService.getQotdsForOffice('office')).rejects.toThrow('Error');
    });

    it('should handle error in getQotdForOffice', async () => {
        (qotdService as any).container.items.query = jest.fn().mockReturnValue({ fetchAll: jest.fn().mockRejectedValue(new Error('Error')) });
        await expect(qotdService.getQotdForOffice('office', new Date())).rejects.toThrow('Error');
    });

    it('should handle error in deleteQotd', async () => {
        (qotdService as any).container.item = jest.fn().mockReturnValue({ delete: jest.fn().mockRejectedValue(new Error('Error')) });
        await expect(qotdService.deleteQotd('id','office')).rejects.toThrow('Error');
    });

    it('should handle error in updateQotd', async () => {
        qotdService.getQotdForOffice = jest.fn().mockRejectedValue(new Error('Error'));
        await expect(qotdService.updateQotd({ officeSpaceId: 'office', date: '2024-01-01' } as any)).rejects.toThrow('Error');
    });

    it('should handle error in getQotdsUntilToday', async () => {
        (qotdService as any).container.items.query = jest.fn().mockReturnValue({ fetchAll: jest.fn().mockRejectedValue(new Error('Error')) });
        await expect(qotdService.getQotdsUntilToday('office')).rejects.toThrow('Error');
    });
});
