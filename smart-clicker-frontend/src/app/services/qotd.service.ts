import { Injectable } from "@angular/core";
import axios from "axios";
import { AuthService } from "./auth.service";
import { Qotd } from "../types/qotd";

@Injectable({
  providedIn: "root",
})
export class QotdService {
  constructor(private authService: AuthService) {}

  private async getAuthConfig() {
    const token = await this.authService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async createQotd(qotd: Qotd): Promise<Qotd> {
    const config = await this.getAuthConfig();
    const response = await axios.post("/api/qotd", qotd, config);
    return response.data as Qotd;
  }

  async getQotdsForOffice(officeSpaceId: string): Promise<Qotd[]> {
    const config = await this.getAuthConfig();
    const response = await axios.get(
      `/api/qotd/office/${encodeURIComponent(officeSpaceId)}`,
      config
    );
    return response.data as Qotd[];
  }

  async getQotdTodayForOffice(officeSpaceId: string): Promise<Qotd | null> {
    const config = await this.getAuthConfig();
    const response = await axios.get(
      `/api/qotd/office/${encodeURIComponent(officeSpaceId)}/today`,
      config
    );
    return response.data as Qotd;
  }

  async getQotdById(id: string, officeSpaceId: string): Promise<Qotd | null> {
    const config = await this.getAuthConfig();
    const response = await axios.get(
      `/api/qotd/${encodeURIComponent(id)}/office/${encodeURIComponent(
        officeSpaceId
      )}`,
      config
    );
    return response.data as Qotd;
  }

  async deleteQotd(id: string, officeSpaceId: string): Promise<void> {
    const config = await this.getAuthConfig();
    await axios.delete(
      `/api/qotd/${encodeURIComponent(id)}/office/${encodeURIComponent(
        officeSpaceId
      )}`,
      config
    );
  }

  async updateQotd(qotd: Qotd): Promise<Qotd | null> {
    const config = await this.getAuthConfig();
    const response = await axios.put(
      `/api/qotd/${encodeURIComponent(
        qotd.id!.toString()
      )}/office/${encodeURIComponent(qotd.officeSpaceId)}`,
      qotd,
      config
    );
    return response.data as Qotd;
  }
}
