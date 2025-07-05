import { Component, OnInit } from "@angular/core";
import * as icons from "@ng-icons/heroicons/outline";
import { OfficeService } from "../../services/office.service";
import { Office } from "../../types/office";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgIconsModule } from "@ng-icons/core";
import { SpinnerComponent } from "../../components";
import { GuardService } from "../../services/guard.service";
import { RoleService } from "../../services/role.service";
import { Permission } from "../../types/permission";
import { ToastService } from "angular-toastify";
import { FloorPlannerComponent } from '../../components/floor-planner/floor-planner.component';

@Component({
    selector: "app-offices",
    templateUrl: "./offices.component.html",
    imports: [CommonModule, FormsModule, NgIconsModule, SpinnerComponent, FloorPlannerComponent],
})
export class OfficesComponent implements OnInit {
    offices: Office[] = [];
    filteredOffices: Office[] = [];
    selectedOffice: Office | null = null;
    isCreateMode = false;
    isEditMode = false;
    searchTerm = '';
    loading = true;
    officeCreate: boolean = false;
    officeUpdate: boolean = false;
    showAnchorEditor = false;
    anchorEditAnchors: { id: number, x: number, y: number }[] = [];

    // Form data for create/edit
    formData: Partial<Office> & { floorPlanName?: string } = {
        name: '',
        wifiName: '',
        wifiPassword: '',
        floorPlan: '',
        floorPlanName: ''
    };

    floorPlanFile: File | null = null;

    // Image details for anchor placement
    detailsImageWidth = 0;
    detailsImageHeight = 0;

    constructor(
        private officeService: OfficeService, private guardService: GuardService, private roleService: RoleService, private toastService: ToastService
    ) { }

    icons = icons;

    async ngOnInit(): Promise<void> {
        const role = await this.roleService.getUserRole();
        const [officeCreate, officeUpdate] = await Promise.all([
            this.guardService.hasAccess(role, Permission.OfficeCreate),
            this.guardService.hasAccess(role, Permission.OfficeUpdate)
        ]);
        this.officeCreate = officeCreate;
        this.officeUpdate = officeUpdate;
        await this.loadOffices();
    }

    async loadOffices(): Promise<void> {
        try {
            this.loading = true;
            this.offices = await this.officeService.getAllOffices();
            this.filterOffices();
        } catch (error) {
            console.error('Error loading offices:', error);
        } finally {
            this.loading = false;
        }
    }

    filterOffices(): void {
        if (!this.searchTerm.trim()) {
            this.filteredOffices = [...this.offices];
        } else {
            const searchTermLower = this.searchTerm.toLowerCase();
            this.filteredOffices = this.offices.filter(office =>
                office.name.toLowerCase().includes(searchTermLower)
            );
        }
    }

    onSearchChange(): void {
        this.filterOffices();
    }

    selectOffice(office: Office): void {
        this.selectedOffice = office;
        this.isCreateMode = false;
        this.isEditMode = false;
    }

    startCreate(): void {
        this.isCreateMode = true;
        this.isEditMode = false;
        this.selectedOffice = null;
        this.formData = {
            name: '',
            wifiName: '',
            wifiPassword: '',
            floorPlan: '',
            floorPlanName: ''
        };
        this.floorPlanFile = null;
    }

    startEdit(office: Office): void {
        this.isEditMode = true;
        this.isCreateMode = false;
        this.selectedOffice = office;
        this.formData = {
            name: office.name,
            wifiName: office.wifiName,
            wifiPassword: office.wifiPassword,
            floorPlan: office.floorPlan || '',
            floorPlanName: ''
        };
        this.floorPlanFile = null;
    }

    cancelEdit(): void {
        this.isCreateMode = false;
        this.isEditMode = false;
        this.selectedOffice = null;
        this.formData = {
            name: '',
            wifiName: '',
            wifiPassword: '',
            floorPlan: '',
            floorPlanName: ''
        };
        this.floorPlanFile = null;
    }

    onFloorPlanSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                this.toastService.error('Only image files are allowed.');
                (event.target as HTMLInputElement).value = '';
                this.formData.floorPlanName = '';
                this.formData.floorPlan = '';
                this.floorPlanFile = null;
                return;
            }
            this.floorPlanFile = file;
            this.formData.floorPlanName = file.name;
            const reader = new FileReader();
            reader.onload = e => this.formData.floorPlan = reader.result as string;
            reader.readAsDataURL(file);
        } else {
            this.formData.floorPlanName = '';
            this.formData.floorPlan = '';
            this.floorPlanFile = null;
        }
    }

    async saveOffice(anchors?: any): Promise<void> {
        try {
            this.loading = true;
            const formData = new FormData();
            if (this.floorPlanFile) {
                formData.append('floorPlan', this.floorPlanFile);
            }

            if (this.isCreateMode) {
                formData.append('name', this.formData.name!);
                formData.append('wifiName', this.formData.wifiName!);
                formData.append('wifiPassword', this.formData.wifiPassword!);
                await this.officeService.createOffice(formData);
            } else if (this.isEditMode && this.selectedOffice) {
                formData.append('name', this.formData.name!);
                formData.append('wifiName', this.formData.wifiName!);
                formData.append('wifiPassword', this.formData.wifiPassword!);
                formData.append('id', this.selectedOffice.id!);
                formData.append('tenantId', this.selectedOffice.tenantId);
                await this.officeService.updateOffice(formData);
            } else if (anchors && this.selectedOffice) {
                formData.append('anchors', JSON.stringify(anchors));
                formData.append('scale', this.selectedOffice.scale?.toString() || '40');
                formData.append('id', this.selectedOffice.id!);
                formData.append('tenantId', this.selectedOffice.tenantId);
                await this.officeService.updateOfficeAnchors(formData);
            }
            await this.officeService.refreshOffices();
            await this.loadOffices();
            this.cancelEdit();
            this.toastService.success('Office saved successfully.');
        } catch (error) {
            console.error('Error saving office:', error);
            this.toastService.error('Failed to save office.');
        } finally {
            this.loading = false;
        }
    }

    openAnchorEditor() {
        if (!this.selectedOffice) return;
        this.anchorEditAnchors = this.selectedOffice.anchors ? [...this.selectedOffice.anchors] : [];
        this.showAnchorEditor = true;
    }

    async closeAnchorEditor(save: boolean) {
        if (save && this.selectedOffice) {
            if (this.anchorEditAnchors.length < 3) {
                this.toastService.error('Please place at least 3 anchors before saving.');
                return;
            }
            await this.saveOffice(this.anchorEditAnchors);
        }
        this.showAnchorEditor = false;
    }

    onAnchorChange(anchors: { id: number, x: number, y: number }[]) {
        this.anchorEditAnchors = anchors;
    }

    onDetailsImageLoad(img: HTMLImageElement) {
        this.detailsImageWidth = img.width;
        this.detailsImageHeight = img.height;
    }

    onScaleChange(newScale: number) {
        if (this.selectedOffice) {
            this.selectedOffice.scale = newScale;
        }
    }
}
