import { Injectable } from "@angular/core";
import axios from "axios";
import { AuthService } from "./auth.service";
import { Role } from "../types/role";

@Injectable({
  providedIn: "root",
})
export class RoleService {
  constructor(private authService: AuthService) {}

  private async getAuthConfig() {
    const token = await this.authService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getUserRole(id: string): Promise<Role> {
    const token = await this.authService.getToken();
    const config = await this.getAuthConfig();
    const response = await axios.get(`/api/role/${id}`, config);
    return response.data as Role;
  }
}
