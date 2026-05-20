import type { Request, Response, NextFunction } from 'express';
import { GPSService } from '../services/gpsService.js';
import { emitGPSUpdate } from '../sockets/socketHandler.js';

export class GPSController {
  static async ingestIoTGPS(req: Request, res: Response, next: NextFunction) {
    try {
      const expectedToken = process.env.IOT_API_TOKEN;
      if (expectedToken && req.header('x-iot-token') !== expectedToken) {
        return res.status(401).json({ error: 'Invalid IoT token' });
      }

      const deviceId = req.body.deviceID || req.body.device_id;
      const lat = req.body.latitude ?? req.body.lat;
      const lng = req.body.longitude ?? req.body.lng;

      if (!deviceId || lat == null || lng == null) {
        return res.status(400).json({ error: 'deviceID, latitude, and longitude are required' });
      }

      const numericLat = Number(lat);
      const numericLng = Number(lng);
      if (!Number.isFinite(numericLat) || !Number.isFinite(numericLng)) {
        return res.status(400).json({ error: 'latitude and longitude must be valid numbers' });
      }

      const gpsData: Parameters<typeof GPSService.saveGPSData>[0] = {
        device_id: String(deviceId),
        lat: numericLat,
        lng: numericLng,
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
      };
      if (req.body.heading != null) gpsData.heading = Number(req.body.heading);
      if (req.body.speed != null) gpsData.speed = Number(req.body.speed);
      if (req.body.battery != null) gpsData.battery = Number(req.body.battery);

      const result = await GPSService.saveGPSData(gpsData);

      if (!result) {
        return res.status(404).json({ error: `GPS device not found for ${deviceId}` });
      }

      emitGPSUpdate(result.gpsId, String(deviceId), result.lat, result.lng);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getEquipmentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { equipmentId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const history = await GPSService.getEquipmentHistory(equipmentId as string , limit);
      
      res.json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllLiveLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await GPSService.getAllLiveLocations();
      
      res.json({
        success: true,
        count: locations.length,
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }
}
