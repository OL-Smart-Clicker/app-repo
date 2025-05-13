import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { RoleService } from './role.service';
import { Permission } from '../types/permission';
import { Role } from '../types/role';
import { calculateBitmask } from '../utils/calculateBitmask';

@Injectable({
    providedIn: 'root'
})
export class GuardService {
    constructor(private authServ: AuthService, private router: Router, private roleServ: RoleService) { }

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        const permission: Permission = route.data['permission'];
        const token = await this.authServ.getToken();
        if (token) {
            const userId = this.authServ.getUserId();

            const role: Role = await this.roleServ.getUserRole(userId);

            const requiredBitmask = calculateBitmask([permission]);
            const userPermissionsBitmask = role.permissions;

            if ((userPermissionsBitmask & requiredBitmask) === requiredBitmask) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            this.router.navigate([this.router.url]);
            return false;
        }
    }

    async hasAccess(permission: Permission): Promise<boolean> {
        const token = await this.authServ.getToken();
        if (token) {
            const userId = this.authServ.getUserId();

            const role: Role = await this.roleServ.getUserRole(userId);

            const requiredBitmask = calculateBitmask([permission]);
            const userPermissionsBitmask = role.permissions;

            return (userPermissionsBitmask & requiredBitmask) === requiredBitmask;
        }
        else {
            return false;
        }
    }
}