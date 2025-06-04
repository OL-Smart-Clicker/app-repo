import { Injectable } from "@angular/core";
import axios from "axios";
import { AuthService } from "./auth.service";
import { Office } from "../types/office";

@Injectable({
  providedIn: "root",
})
export class OfficeService {
  constructor(private authService: AuthService) { }

  private async getAuthConfig() {
    const token = await this.authService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
  async getOfficeById(id: string): Promise<Office> {
    const config = await this.getAuthConfig();
    const response = await axios.get(`api/office/${id}`, config);
    return response.data as Office;
  }

  async createOffice(office: Partial<Office>): Promise<Office> {
    const config = await this.getAuthConfig();
    const response = await axios.post(`api/office`, office, config);
    return response.data as Office;
  }
  async updateOffice(office: Office): Promise<Office> {
    const config = await this.getAuthConfig();
    const response = await axios.put(`api/office/${office.id}`, office, config);
    return response.data as Office;
  }

  async getAllOffices(): Promise<Office[]> {
    const config = await this.getAuthConfig();
    const response = await axios.get(`api/office`, config);
    return response.data as Office[];
  }
}
