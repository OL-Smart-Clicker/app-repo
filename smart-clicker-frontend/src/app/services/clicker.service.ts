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

  async getClickerData(officeSpaceId: string): Promise<any> {
    const config = await this.getAuthConfig();
    const response = await axios.get(`/api/clicker-data/${officeSpaceId}`, config);
    return response.data;
  }
}
