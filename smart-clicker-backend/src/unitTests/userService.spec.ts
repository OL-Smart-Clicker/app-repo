import { UserService } from '../services/userService';

jest.mock('../auth/graphAuth', () => ({ getGraphToken: jest.fn().mockResolvedValue({ accessToken: 'token' }), graphTokenRequest: {} }));
jest.mock('axios');
// jest.mock('../db/db', () => require('./mockDb'));

describe('UserService', () => {
    let userService: UserService;
    beforeEach(() => {
        userService = new UserService();
    });

    it('should instantiate', () => {
        expect(userService).toBeDefined();
    });

    it('should get users and assign roles', async () => {
        const mockUsers = [{ id: '1' }, { id: '2' }];
        const mockRole = { id: 'role1' };
        (userService as any).graphConfig.getGraphToken = jest.fn().mockResolvedValue({ accessToken: 'token' });
        require('axios').get = jest.fn().mockResolvedValue({ data: { value: mockUsers } });
        userService['roleServ'].getUserRole = jest.fn().mockResolvedValue(mockRole);
        const users = await userService.getUsers('tenant1');
        expect(users.length).toBe(2);
        expect(users[0]).toMatchObject({ ...mockUsers[0], role: mockRole });
    });

    it('should handle error in getUsers', async () => {
        require('axios').get = jest.fn().mockRejectedValue(new Error('fail'));
        await expect(userService.getUsers('tenant1')).rejects.toThrow('fail');
    });

    it('should handle empty user list', async () => {
        require('axios').get = jest.fn().mockResolvedValue({ data: { value: [] } });
        const users = await userService.getUsers('tenant1');
        expect(users).toEqual([]);
    });
});
