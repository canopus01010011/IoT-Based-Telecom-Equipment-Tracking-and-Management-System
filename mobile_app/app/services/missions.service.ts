import { Mission } from "../types/mission.types";
import api from "./api";

export interface MissionResponse {
  success: boolean;
  data: Mission;
}

export async function getMissionById(id: string): Promise<Mission> {
  try {
    const response = await api.get<MissionResponse>(`/missions/${id}`);

    return response.data.data;
  } catch (error: any) {
    console.error(
      "getMissionById error:",
      error?.response?.data || error.message,
    );
    throw new Error("Failed to fetch mission");
  }
}


export async function getAllMissions(): Promise<Mission[]> {
  try {
    const response = await api.get<{ success: boolean; data: Mission[] }>(
      "/missions",
    );

    return response.data.data;
  } catch (error: any) {
    console.error(
      "getAllMissions error:",
      error?.response?.data || error.message,
    );
    throw new Error("Failed to fetch missions");
  }
}
