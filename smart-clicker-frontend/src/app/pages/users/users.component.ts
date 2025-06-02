import { Component, OnInit } from "@angular/core";
import { GuardService } from "../../services/guard.service";
import * as icons from "@ng-icons/heroicons/outline";
import { UserService } from "../../services/user.service";
import { RoleService } from "../../services/role.service";
import { User } from "../../types/user";
import { Role } from "../../types/role";
import { Permission } from "../../types/permission";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgIconsModule } from "@ng-icons/core";
import { SpinnerComponent } from "../../components";

@Component({
    selector: "app-users",
    templateUrl: "./users.component.html",
    imports: [CommonModule, FormsModule, NgIconsModule, SpinnerComponent],
})
export class UsersComponent implements OnInit {
    users: User[] = [];
    filteredUsers: User[] = [];
    roles: Role[] = [];
    selectedUser: User | null = null;
    isAssignRoleMode = false;
    searchTerm = '';
    loading = false;
    roleAssignLoading = false;

    // Form data for role assignment
    selectedRoleId: string = '';

    constructor(
        private guardServ: GuardService,
        private userService: UserService,
        private roleService: RoleService,
    ) { }    icons = icons;
    async ngOnInit(): Promise<void> {
        await Promise.all([
            this.loadUsers(),
            this.loadRoles()
        ]);
    }

    async loadUsers(): Promise<void> {
        try {
            this.loading = true;
            this.users = await this.userService.getAllUsers();
            this.filterUsers();
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            this.loading = false;
        }
    }

    async loadRoles(): Promise<void> {
        try {
            this.roles = await this.roleService.getAllRoles();
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    }

    filterUsers(): void {
        if (!this.searchTerm.trim()) {
            this.filteredUsers = [...this.users];
        } else {
            const searchTermLower = this.searchTerm.toLowerCase();
            this.filteredUsers = this.users.filter(user =>
                user.displayName?.toLowerCase().includes(searchTermLower) ||
                user.userPrincipalName?.toLowerCase().includes(searchTermLower) ||
                user.givenName?.toLowerCase().includes(searchTermLower) ||
                user.surname?.toLowerCase().includes(searchTermLower)
            );
        }
    }

    onSearchChange(): void {
        this.filterUsers();
    }

    selectUser(user: User): void {
        this.selectedUser = user;
        this.isAssignRoleMode = false;
        this.selectedRoleId = user.role?.id || '';
    }

    startAssignRole(user: User): void {
        this.selectedUser = user;
        this.isAssignRoleMode = true;
        this.selectedRoleId = user.role?.id || '';
    }

    cancelAssignRole(): void {
        this.isAssignRoleMode = false;
        this.selectedUser = null;
        this.selectedRoleId = '';
    }

    async assignRole(): Promise<void> {
        if (!this.selectedUser || !this.selectedRoleId) {
            return;
        }

        try {
            this.roleAssignLoading = true;
            await this.userService.assignRoleToUser(this.selectedUser.id, this.selectedRoleId);
            await this.loadUsers();
            this.cancelAssignRole();
        } catch (error) {
            console.error('Error assigning role:', error);
        } finally {
            this.roleAssignLoading = false;
        }
    }

    getRoleName(user: User): string {
        return user.role?.roleName || 'No Role Assigned';
    }

    getPermissionNames(permissions: number): string[] {
        const permissionOptions = [
            { key: Permission.QuestionView, label: 'View Questions', value: Permission.QuestionView },
            { key: Permission.QuestionCreate, label: 'Create Questions', value: Permission.QuestionCreate },
            { key: Permission.QuestionUpdate, label: 'Update Questions', value: Permission.QuestionUpdate },
            { key: Permission.QuestionDelete, label: 'Delete Questions', value: Permission.QuestionDelete },
            { key: Permission.DataView, label: 'View Data', value: Permission.DataView },
            { key: Permission.RolesView, label: 'View Roles', value: Permission.RolesView },
            { key: Permission.RolesCreate, label: 'Create Roles', value: Permission.RolesCreate },
            { key: Permission.RolesUpdate, label: 'Update Roles', value: Permission.RolesUpdate },
            { key: Permission.RolesAssign, label: 'Assign Roles', value: Permission.RolesAssign },
            { key: Permission.OfficeView, label: 'View Offices', value: Permission.OfficeView },
            { key: Permission.OfficeCreate, label: 'Create Offices', value: Permission.OfficeCreate },
            { key: Permission.OfficeUpdate, label: 'Update Offices', value: Permission.OfficeUpdate },
        ];

        return permissionOptions
            .filter(option => (permissions & option.value) === option.value)
            .map(option => option.label);
    }

    getTotalPermissionsCount(permissions: number): number {
        const permissionOptions = [
            { key: Permission.QuestionView, label: 'View Questions', value: Permission.QuestionView },
            { key: Permission.QuestionCreate, label: 'Create Questions', value: Permission.QuestionCreate },
            { key: Permission.QuestionUpdate, label: 'Update Questions', value: Permission.QuestionUpdate },
            { key: Permission.QuestionDelete, label: 'Delete Questions', value: Permission.QuestionDelete },
            { key: Permission.DataView, label: 'View Data', value: Permission.DataView },
            { key: Permission.RolesView, label: 'View Roles', value: Permission.RolesView },
            { key: Permission.RolesCreate, label: 'Create Roles', value: Permission.RolesCreate },
            { key: Permission.RolesUpdate, label: 'Update Roles', value: Permission.RolesUpdate },
            { key: Permission.RolesAssign, label: 'Assign Roles', value: Permission.RolesAssign },
            { key: Permission.OfficeView, label: 'View Offices', value: Permission.OfficeView },
            { key: Permission.OfficeCreate, label: 'Create Offices', value: Permission.OfficeCreate },
            { key: Permission.OfficeUpdate, label: 'Update Offices', value: Permission.OfficeUpdate },
        ];

        return permissionOptions
            .filter(option => (permissions & option.value) === option.value)
            .length;
    }

    get selectedRole() {
        return this.roles?.find(role => role.id === this.selectedRoleId) || null;
    }
}
