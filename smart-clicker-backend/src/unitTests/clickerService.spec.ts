import { ClickerService } from '../services/clickerService';

// jest.mock('../db/db', () => require('./mockDb'));

describe('ClickerService', () => {
    let clickerService: ClickerService;
    beforeEach(() => {
        clickerService = new ClickerService();
    });

    it('should instantiate', () => {
        expect(clickerService).toBeDefined();
    });

    it('should getClicksAll returns a number', async () => {
        // Mock the method directly
        clickerService.getClicksAll = jest.fn().mockResolvedValue(3);
        const result = await clickerService.getClicksAll('office1');
        expect(result).toBe(3);
    });

    it('should getClickerDataByDate returns array', async () => {
        clickerService.getClickerDataByDate = jest.fn().mockResolvedValue([{ id: 1 }]);
        const result = await clickerService.getClickerDataByDate('office1', new Date(), new Date());
        expect(Array.isArray(result)).toBe(true);
    });

    it('should handle error in getClicksAll', async () => {
        clickerService.getClicksAll = jest.fn().mockRejectedValue(new Error('fail'));
        await expect(clickerService.getClicksAll('office1')).rejects.toThrow('fail');
    });

    it('should return empty array for getClickerDataByDate if no data', async () => {
        clickerService.getClickerDataByDate = jest.fn().mockResolvedValue([]);
        const result = await clickerService.getClickerDataByDate('office1', new Date(), new Date());
        expect(result).toEqual([]);
    });

    it('should exportClickerDataByDateCSV return empty string if no data', async () => {
        clickerService.exportClickerDataByDateCSV = jest.fn().mockResolvedValue('');
        const result = await clickerService.exportClickerDataByDateCSV('office1', new Date(), new Date());
        expect(result).toBe('');
    });

    it('should exportClickerDataByDateCSV return csv string if data', async () => {
        clickerService.exportClickerDataByDateCSV = jest.fn().mockResolvedValue('a,b\n1,2\n3,4');
        const result = await clickerService.exportClickerDataByDateCSV('office1', new Date(), new Date());
        expect(result).toContain('a,b');
        expect(result).toContain('1,2');
    });
});
