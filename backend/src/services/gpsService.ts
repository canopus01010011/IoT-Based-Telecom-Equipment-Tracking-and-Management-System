import { GPSLog, Equipment } from '../models/index.js';
import { Op } from 'sequelize';

interface GPSData {
  device_id: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp?: Date;
}

export class GPSService {
  static async saveGPSData(data: GPSData) {
    try {
      // 1. Find equipment by device_id
      const equipment = await Equipment.findOne({
        where: { device_id: data.device_id }
      });

      if (!equipment) {
        console.error(`❌ Equipment not found for device_id: ${data.device_id}`);
        console.log(`💡 Create equipment with device_id: ${data.device_id}`);
        return null;
      }

      // 2. Save to GPS logs table
      const gpsLog = await GPSLog.create({
        equipment_id: equipment.id,
        latitude: data.lat,
        longitude: data.lng,
        speed: data.speed || 0,
        heading: data.heading || 0,
        accuracy: data.accuracy || 0,
        timestamp: data.timestamp || new Date(),
      });

      // 3. Update equipment's current location
      await equipment.update({
        current_latitude: data.lat,
        current_longitude: data.lng,
        last_gps_update: new Date(),
      });

      console.log(`✅ GPS saved: ${equipment.name} at [${data.lat}, ${data.lng}]`);
      
      return {
        success: true,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        lat: data.lat,
        lng: data.lng,
      };
    } catch (error) {
      console.error('❌ Error saving GPS data:', error);
      return null;
    }
  }

  static async getEquipmentHistory(equipmentId: string, limit: number = 100) {
    const logs = await GPSLog.findAll({
      where: { equipment_id: equipmentId },
      order: [['timestamp', 'DESC']],
      limit: limit,
    });
    return logs;
  }

  static async getAllLiveLocations() {
    const equipment = await Equipment.findAll({
      where: {
        current_latitude: { [Op.ne]: null } as any,
        current_longitude: { [Op.ne]: null } as any,
      },
      attributes: ['id', 'name', 'device_id', 'current_latitude', 'current_longitude', 'last_gps_update', 'status'],
    });
    return equipment;
  }
}