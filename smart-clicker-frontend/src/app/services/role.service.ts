import { Injectable } from '@angular/core';
import { env } from '../../environments/environment';
import axios from 'axios';
import { AuthService } from './auth.service';
import { Role } from '../types/role';

@Injectable({
    providedIn: 'root'
})

export class RoleService {

    constructor(private authService: AuthService) {
    }

    async getUserRole(id: string): Promise<Role> {
        const token = await this.authService.getToken();
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.get(`${env.API_URL}/role/${id}`, config)
        return response.data as Role;
    }
}
