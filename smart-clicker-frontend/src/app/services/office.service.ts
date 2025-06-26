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

  private async getAuthFormDataConfig() {
    const token = await this.authService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    };
  }

  async createOffice(data: FormData): Promise<Office> {
    const config = await this.getAuthFormDataConfig();
    const response = await axios.post(`api/office`, data, config);
    return response.data as Office;
  }

  async updateOffice(data: FormData): Promise<Office> {
    const config = await this.getAuthFormDataConfig();
    const response = await axios.put(`api/office/${data.get('id')}`, data, config);
    return response.data as Office;
  }

  async updateOfficeAnchors(data: FormData): Promise<Office> {
    const config = await this.getAuthFormDataConfig();
    const response = await axios.put(`api/office/${data.get('id')}/anchors`, data, config);
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
