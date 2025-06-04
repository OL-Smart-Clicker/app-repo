import { Component, OnInit } from "@angular/core";
import { GuardService } from "../../services/guard.service";
import * as icons from "@ng-icons/heroicons/outline";
import { RoleService } from "../../services/role.service";
import { Role } from "../../types/role";
import { Permission } from "../../types/permission";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgIconsModule } from "@ng-icons/core";
import { SpinnerComponent } from "../../components";
import { AuthService } from "../../services/auth.service";

@Component({
    selector: "app-roles",
    templateUrl: "./roles.component.html",
    imports: [CommonModule, FormsModule, NgIconsModule, SpinnerComponent],
})
export class RolesComponent implements OnInit {
    roles: Role[] = [];
    filteredRoles: Role[] = [];
    selectedRole: Role | null = null;
    isCreateMode = false;
    isEditMode = false;
    searchTerm = '';
    loading = false;

    // Form data for create/edit
    formData: Partial<Role> = {
        roleName: '',
        permissions: 0
    };

    permissionOptions = [
        { key: Permission.QuestionCreate, label: 'Create Questions', value: Permission.QuestionCreate },
        { key: Permission.QuestionView, label: 'View Questions', value: Permission.QuestionView },
        { key: Permission.QuestionUpdate, label: 'Update Questions', value: Permission.QuestionUpdate },
        { key: Permission.QuestionDelete, label: 'Delete Questions', value: Permission.QuestionDelete },
        { key: Permission.DataView, label: 'View Data', value: Permission.DataView },
        { key: Permission.RolesCreate, label: 'Create Roles', value: Permission.RolesCreate },
        { key: Permission.RolesView, label: 'View Roles', value: Permission.RolesView },
        { key: Permission.RolesUpdate, label: 'Update Roles', value: Permission.RolesUpdate },
        { key: Permission.RolesAssign, label: 'Assign Roles', value: Permission.RolesAssign },
        { key: Permission.OfficeCreate, label: 'Create Offices', value: Permission.OfficeCreate },
        { key: Permission.OfficeView, label: 'View Offices', value: Permission.OfficeView },
        { key: Permission.OfficeUpdate, label: 'Update Offices', value: Permission.OfficeUpdate },
    ];

    constructor(
        private guardServ: GuardService,
        private roleService: RoleService,
        private authService: AuthService,
    ) { }    icons = icons;
    async ngOnInit(): Promise<void> {
        await this.loadRoles();
    }

    async loadRoles(): Promise<void> {
        try {
            this.loading = true;
            this.roles = await this.roleService.getAllRoles();
            this.filterRoles();
        } catch (error) {
            console.error('Error loading roles:', error);
        } finally {
            this.loading = false;
        }
    }

    filterRoles(): void {
        if (!this.searchTerm.trim()) {
            this.filteredRoles = [...this.roles];
        } else {
            const searchTermLower = this.searchTerm.toLowerCase();
            this.filteredRoles = this.roles.filter(role =>
                role.roleName.toLowerCase().includes(searchTermLower)
            );
        }
    }

    onSearchChange(): void {
        this.filterRoles();
    }

    selectRole(role: Role): void {
        this.selectedRole = role;
        this.isCreateMode = false;
        this.isEditMode = false;
    }

    startCreate(): void {
        this.isCreateMode = true;
        this.isEditMode = false;
        this.selectedRole = null;
        this.formData = {
            roleName: '',
            permissions: 0
        };
    }

    startEdit(role: Role): void {
        this.isEditMode = true;
        this.isCreateMode = false;
        this.selectedRole = role;
        this.formData = {
            roleName: role.roleName,
            permissions: role.permissions
        };
    }

    cancelEdit(): void {
        this.isCreateMode = false;
        this.isEditMode = false;
        this.selectedRole = null;
        this.formData = {
            roleName: '',
            permissions: 0
        };
    }

    async saveRole(): Promise<void> {
        try {
            this.loading = true;
            const roleData: Role = {
                roleName: this.formData.roleName!,
                tenantId: this.selectedRole?.tenantId || this.authService.getTenantId(),
                permissions: this.formData.permissions!
            };

            if (this.isCreateMode) {
                await this.roleService.createRole(roleData);
            } else if (this.isEditMode && this.selectedRole) {
                roleData.id = this.selectedRole.id;
                await this.roleService.updateRole(roleData);
            }

            await this.loadRoles();
            this.cancelEdit();
        } catch (error) {
            console.error('Error saving role:', error);
        } finally {
            this.loading = false;
        }
    }

    togglePermission(permission: Permission): void {
        if (this.hasPermission(permission)) {
            this.formData.permissions! &= ~permission;
        } else {
            this.formData.permissions! |= permission;
        }
    }

    hasPermission(permission: Permission): boolean {
        return (this.formData.permissions! & permission) === permission;
    }

    getPermissionNames(permissions: number): string[] {
        return this.permissionOptions
            .filter(option => (permissions & option.value) === option.value)
            .map(option => option.label);
    }

    getTotalPermissionsCount(permissions: number): number {
        return this.permissionOptions
            .filter(option => (permissions & option.value) === option.value)
            .length;
    }
}
