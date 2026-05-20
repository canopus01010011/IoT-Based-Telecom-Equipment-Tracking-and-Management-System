import { GPSDevice, TrackingData } from '../models/index.js';
import { Op } from 'sequelize';

interface GPSData {
  device_id: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  battery?: number;
  timestamp?: Date;
}

export class GPSService {
  static async saveGPSData(data: GPSData) {
    try {
      const gpsDevice = await GPSDevice.findOne({
        where: { device_serial_number: data.device_id },
      });

      if (!gpsDevice) {
        console.error(`GPS device not found for serial number: ${data.device_id}`);
        return null;
      }

      const timestamp = data.timestamp || new Date();

      if (typeof data.battery === 'number' && Number.isFinite(data.battery)) {
        await gpsDevice.update({
          battery_level: Math.max(0, Math.min(100, Math.round(data.battery))),
          device_status: 'active',
        });
      }

      // Save the new tracking point
      await TrackingData.create({
        gps_id: gpsDevice.id,
        latitude: data.lat,
        longitude: data.lng,
        timestamp,
      });

      // Automatically prune data older than 1 minute to prevent database bloat
      await TrackingData.destroy({
        where: {
          gps_id: gpsDevice.id,
          timestamp: {
            [Op.lt]: new Date(Date.now() - 60 * 1000)
          }
        }
      });

      return {
        success: true,
        gpsId: gpsDevice.id,
        lat: data.lat,
        lng: data.lng,
      };
    } catch (error) {
      console.error('Error saving GPS data:', error);
      return null;
    }
  }

  static async getEquipmentHistory(gpsId: string, limit: number = 100) {
    return TrackingData.findAll({
      where: { gps_id: gpsId },
      order: [['timestamp', 'DESC']],
      limit,
    });
  }

  static async getAllLiveLocations() {
    return GPSDevice.findAll({
      attributes: ['id', 'container_id', 'device_serial_number', 'battery_level', 'device_status'],
      include: [
        {
          model: TrackingData,
          separate: true,
          limit: 1,
          order: [['timestamp', 'DESC']],
        },
      ],
    });
  }
}
