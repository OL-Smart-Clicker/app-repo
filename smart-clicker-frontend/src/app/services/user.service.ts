import { Injectable } from "@angular/core";
import axios from "axios";
import { AuthService } from "./auth.service";
import { User } from "../types/user";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private authService: AuthService) { }

  private async getAuthConfig() {
    const token = await this.authService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    const config = await this.getAuthConfig();
    await axios.post(`api/role/assign`, { userId, roleId }, config);
  }

  async getAllUsers(): Promise<User[]> {
    const config = await this.getAuthConfig();
    const response = await axios.get(`api/user`, config);
    return response.data as User[];
  }
}
