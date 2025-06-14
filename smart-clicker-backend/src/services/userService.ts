import graphConfig from '../auth/graphAuth';
import axios, { AxiosRequestConfig } from 'axios';
import { User } from '../models/user';
import { RoleService } from './roleService';

export class UserService {

    private graphConfig: any;
    private roleServ: RoleService = new RoleService();

    constructor() {
        this.graphConfig = graphConfig;
    }

    private async getConfig(): Promise<AxiosRequestConfig> {
        const token = await this.graphConfig.getGraphToken(this.graphConfig.graphTokenRequest);
        return {
            headers: {
                Authorization: `Bearer ${token?.accessToken}`
            }
        };
    }

    async getUsers(tenantId: string): Promise<User[]> {
        const config = await this.getConfig();
        const response = await axios.get(`${process.env.GRAPH_API_ENDPOINT}v1.0/users`, config);
        const users = await Promise.all(
            response.data.value.map(async (user: User) => {
                const role = await this.roleServ.getUserRole(user.id, tenantId);
                if (role) {
                    user.role = role;
                }
                return { ...user }
            })
        );
        return users;
    }
}