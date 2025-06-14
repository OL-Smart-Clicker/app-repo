import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import axios from "axios";
import { AuthService } from "./auth.service";
import { Office } from "../types/office";

@Injectable({
  providedIn: "root",
})
export class OfficeService {
  private officeIdSubject: BehaviorSubject<string>;
  officeId$;
  private officesSubject = new BehaviorSubject<Office[]>([]);
  offices$ = this.officesSubject.asObservable();

  constructor(private authService: AuthService) {
    const savedId = localStorage.getItem("officeId") || "";
    this.officeIdSubject = new BehaviorSubject<string>(savedId);
    this.officeId$ = this.officeIdSubject.asObservable();
  }

  private async getAuthConfig() {
    const token = await this.authService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async createOffice(office: Partial<Office>): Promise<Office> {
    const config = await this.getAuthConfig();
    const response = await axios.post(`api/office`, office, config);
    const createdOffice = response.data as Office;
    await this.refreshOffices();
    const offices = this.officesSubject.value;
    if (offices.length === 1) {
      this.setOfficeId(createdOffice.id);
    }
    return createdOffice;
  }

  async updateOffice(office: Office): Promise<Office> {
    const config = await this.getAuthConfig();
    const response = await axios.put(`api/office/${office.id}`, office, config);
    return response.data as Office;
  }

  async getAllOffices(): Promise<Office[]> {
    const config = await this.getAuthConfig();
    const response = await axios.get(`api/office`, config);
    const offices = response.data as Office[];
    this.officesSubject.next(offices);
    return offices;
  }

  async refreshOffices(): Promise<void> {
    await this.getAllOffices();
  }

  setOfficeId(id: string) {
    this.officeIdSubject.next(id);
    localStorage.setItem("officeId", id);
  }

  getOfficeId(): string {
    return this.officeIdSubject.value;
  }
}
