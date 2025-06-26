import { calculateBitmask } from '../utils/calculateBitmask';

describe('calculateBitmask', () => {
    it('should return 0 for empty array', () => {
        expect(calculateBitmask([])).toBe(0);
    });
    it('should OR all permissions', () => {
        expect(calculateBitmask([1,2,4])).toBe(7);
    });
});
