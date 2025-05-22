import { Injectable } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth.service';
import { Role } from '../types/role';

@Injectable({
    providedIn: 'root'
})

export class ClickerService {

    constructor(private authService: AuthService) {
    }

    async getClickerData(): Promise<any> {
        const token = await this.authService.getToken();
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.get(`/api/clicker-data`, config)
        return response.data;
    }
}
