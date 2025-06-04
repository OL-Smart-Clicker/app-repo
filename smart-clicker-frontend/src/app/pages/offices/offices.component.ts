import { Component, OnInit } from "@angular/core";
import * as icons from "@ng-icons/heroicons/outline";
import { OfficeService } from "../../services/office.service";
import { Office } from "../../types/office";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgIconsModule } from "@ng-icons/core";
import { SpinnerComponent } from "../../components";

@Component({
    selector: "app-offices",
    templateUrl: "./offices.component.html",
    imports: [CommonModule, FormsModule, NgIconsModule, SpinnerComponent],
})
export class OfficesComponent implements OnInit {
    offices: Office[] = [];
    filteredOffices: Office[] = [];
    selectedOffice: Office | null = null;
    isCreateMode = false;
    isEditMode = false;
    searchTerm = '';
    loading = false;

    // Form data for create/edit
    formData: Partial<Office> = {
        name: ''
    };

    constructor(
        private officeService: OfficeService,
    ) { } icons = icons;
    async ngOnInit(): Promise<void> {
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
            name: ''
        };
    }

    startEdit(office: Office): void {
        this.isEditMode = true;
        this.isCreateMode = false;
        this.selectedOffice = office;
        this.formData = {
            name: office.name
        };
    }

    cancelEdit(): void {
        this.isCreateMode = false;
        this.isEditMode = false;
        this.selectedOffice = null;
        this.formData = {
            name: ''
        };
    }

    async saveOffice(): Promise<void> {
        try {
            this.loading = true;

            if (this.isCreateMode) {
                await this.officeService.createOffice(this.formData);
            } else if (this.isEditMode && this.selectedOffice) {
                const officeData: Office = {
                    id: this.selectedOffice.id,
                    tenantId: this.selectedOffice.tenantId,
                    name: this.formData.name!
                };
                await this.officeService.updateOffice(officeData);
            }

            await this.loadOffices();
            this.cancelEdit();
        } catch (error) {
            console.error('Error saving office:', error);
        } finally {
            this.loading = false;
        }
    }
}
