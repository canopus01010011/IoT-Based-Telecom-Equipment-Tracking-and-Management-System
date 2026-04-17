export interface MissionFile {
  mission_id: string;
  title: string;
  status: string;
  scheduled_at: string;
  site: { name: string; address: string; latitude: number; longitude: number; };
  technician: { id: string; name: string; phone: string; };
  driver: { id: string; name: string; phone: string; };
  equipment: { id: string; name: string; serial: string;  }[];
  notes: string;
}