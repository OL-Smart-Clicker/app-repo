jest.mock('../db/db', () => ({
    container: jest.fn().mockReturnValue({
        items: {
            query: jest.fn().mockReturnValue({
                fetchAll: jest.fn().mockResolvedValue({ resources: [1,2,3] })
            })
        }
    })
}));

import { ClickerService } from '../services/clickerService';

describe('ClickerService', () => {
    let clickerService: ClickerService;
    beforeEach(() => {
        clickerService = new ClickerService();
    });

    it('should instantiate', () => {
        expect(clickerService).toBeDefined();
    });

    it('should getClicksAll returns a number', async () => {
        const result = await clickerService.getClicksAll('office1');
        expect(result).toBe(3);
    });

    it('should getClickerDataByDate returns array', async () => {
        // Patch the mock to return a different resource
        ((clickerService as any).container.items.query as jest.Mock).mockReturnValueOnce({ fetchAll: jest.fn().mockResolvedValue({ resources: [{id:1}] }) });
        const result = await clickerService.getClickerDataByDate('office1', new Date(), new Date());
        expect(Array.isArray(result)).toBe(true);
    });

    it('should handle error in getClicksAll', async () => {
        ((clickerService as any).container.items.query as jest.Mock).mockImplementationOnce(() => { throw new Error('fail'); });
        await expect(clickerService.getClicksAll('office1')).rejects.toThrow('fail');
    });

    it('should return empty array for getClickerDataByDate if no data', async () => {
        ((clickerService as any).container.items.query as jest.Mock).mockReturnValueOnce({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
        const result = await clickerService.getClickerDataByDate('office1', new Date(), new Date());
        expect(result).toEqual([]);
    });

    it('should exportClickerDataByDateCSV return empty string if no data', async () => {
        ((clickerService as any).container.items.query as jest.Mock).mockReturnValueOnce({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
        const result = await clickerService.exportClickerDataByDateCSV('office1', new Date(), new Date());
        expect(result).toBe('');
    });

    it('should exportClickerDataByDateCSV return csv string if data', async () => {
        ((clickerService as any).container.items.query as jest.Mock).mockReturnValueOnce({ fetchAll: jest.fn().mockResolvedValue({ resources: [{a:1,b:2},{a:3,b:4}] }) });
        const result = await clickerService.exportClickerDataByDateCSV('office1', new Date(), new Date());
        expect(result).toContain('a,b');
        expect(result).toContain('1,2');
    });
});
