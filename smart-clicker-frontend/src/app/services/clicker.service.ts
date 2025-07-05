import { Injectable } from "@angular/core";
import axios from "axios";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class ClickerService {
  constructor(private authService: AuthService) { }

  private async getAuthConfig() {
    const token = await this.authService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getClicksAll(officeSpaceId: string): Promise<any> {
    const config = await this.getAuthConfig();
    const response = await axios.get(`/api/clicker-data/${officeSpaceId}/all`, config);
    return response.data;
  }

  async getClicksWeek(officeSpaceId: string): Promise<any> {
    const config = await this.getAuthConfig();
    const response = await axios.get(`/api/clicker-data/${officeSpaceId}/week`, config);
    return response.data;
  }

  async getClickerDataByDate(officeSpaceId: string, startDate: Date, endDate: Date): Promise<any> {
    const config = await this.getAuthConfig();
    const response = await axios.get(`/api/clicker-data/${officeSpaceId}?startDate=${encodeURIComponent(startDate.toISOString())}&endDate=${encodeURIComponent(endDate.toISOString())}`, config);
    return response.data;
  }

  async downloadClickerDataCSV(officeSpaceId: string, startDate: Date, endDate: Date): Promise<void> {
    const config = await this.getAuthConfig();
    const url = `/api/clicker-data/${officeSpaceId}?startDate=${encodeURIComponent(startDate.toISOString())}&endDate=${encodeURIComponent(endDate.toISOString())}&csv=true`;
    const response = await axios.get(url, { ...config, responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `clicker_data_${officeSpaceId}_${startDate.toISOString()}_${endDate.toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
