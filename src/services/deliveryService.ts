import { Delivery, Mission, Equipment, User } from '../models/index.js';
import { Op } from 'sequelize';

interface ScanData {
  missionId: string;
  qrCode: string;
  userId: string;
  userRole: 'admin' | 'technician' | 'driver';
  latitude?: number;
  longitude?: number;
}

export class DeliveryService {
  /**
   * Process QR scan (driver or technician)
   */
  static async processScan(data: ScanData) {
    const { missionId, qrCode, userId, userRole, latitude, longitude } = data;

    // 1. Find mission by ID and validate QR code
    const mission = await Mission.findOne({
      where: {
        id: missionId,
        qr_code: qrCode,
      },
      include: [
        { model: User, as: 'technician' },
        { model: User, as: 'driver' },
        { model: Equipment },
      ],
    });

    if (!mission) {
      throw new Error('Invalid mission ID or QR code');
    }

    // 2. Check mission status
    if (mission.status === 'cancelled') {
      throw new Error('Mission has been cancelled');
    }

    if (mission.status === 'delivered') {
      throw new Error('Mission already completed');
    }

    // 3. Handle based on user role
    if (userRole === 'driver') {
      return this.handleDriverScan(mission, userId, latitude, longitude);
    } 
    
    if (userRole === 'technician') {
      return this.handleTechnicianScan(mission, userId, latitude, longitude);
    }

    throw new Error('Only drivers and technicians can scan QR codes');
  }

  /**
   * Handle driver scan (first scan)
   */
  private static async handleDriverScan(
    mission: Mission,
    driverId: string,
    latitude?: number,
    longitude?: number
  ) {
    // Verify driver is assigned to this mission
    if (mission.driver_id !== driverId) {
      throw new Error('You are not assigned as driver for this mission');
    }

    // Check if driver already scanned
    if (mission.driver_scanned_at) {
      throw new Error('Driver already scanned this mission');
    }

    // Update mission with driver scan
    await mission.update({
      status: 'driver_scanned',
      driver_scanned_at: new Date(),
    });

    // Create or update delivery record
    const [delivery, created] = await Delivery.findOrCreate({
      where: { mission_id: mission.id },
      defaults: {
        mission_id: mission.id,
        driver_id: mission.driver_id,
        technician_id: mission.technician_id,
        qr_code_scanned: mission.qr_code,
        driver_scanned_at: new Date(),
        driver_scan_lat: latitude ?? null,
        driver_scan_lng: longitude ?? null,
        delivered_at: new Date(), // Temporary, will update on technician scan
      } as any,
    });

    if (!created) {
      await delivery.update({
        driver_scanned_at: new Date(),
        driver_scan_lat: latitude ?? null,
        driver_scan_lng: longitude ?? null,
      }as any );
    }

    return {
      success: true,
      message: 'Driver scan recorded. Waiting for technician scan.',
      status: mission.status,
      nextStep: 'technician_scan_required',
    };
  }

  /**
   * Handle technician scan (second scan - final confirmation)
   */
  private static async handleTechnicianScan(
    mission: Mission,
    technicianId: string,
    latitude?: number,
    longitude?: number
  ) {
    // Verify technician is assigned to this mission
    if (mission.technician_id !== technicianId) {
      throw new Error('You are not assigned as technician for this mission');
    }

    // Check if driver already scanned
    if (!mission.driver_scanned_at) {
      throw new Error('Driver must scan QR code before technician');
    }

    // Check if technician already scanned
    if (mission.technician_scanned_at) {
      throw new Error('Technician already scanned this mission');
    }

    // Update mission with technician scan and mark as delivered
    await mission.update({
      status: 'delivered',
      technician_scanned_at: new Date(),
      delivered_at: new Date(),
    });

    // Update delivery record
    const delivery = await Delivery.findOne({
      where: { mission_id: mission.id },
    });

    if (delivery) {
      await delivery.update({
        technician_scanned_at: new Date(),
        technician_scan_lat: latitude ?? null,
        technician_scan_lng: longitude ?? null,
        delivered_at: new Date(),
      } as any );
    } else {
      // Fallback: create delivery record if doesn't exist
      await Delivery.create({
        mission_id: mission.id,
        driver_id: mission.driver_id,
        technician_id: mission.technician_id,
        qr_code_scanned: mission.qr_code,
        driver_scanned_at: mission.driver_scanned_at || new Date(),
        technician_scanned_at: new Date(),
        delivered_at: new Date(),
        technician_scan_lat: latitude ?? null,
        technician_scan_lng: longitude ?? null,
      } as any );
    }

    // Update equipment status back to available
    await Equipment.update(
      { status: 'available' },
      { where: { id: mission.equipment_id } }
    );

    return {
      success: true,
      message: 'Delivery confirmed successfully!',
      status: mission.status,
      deliveredAt: mission.delivered_at,
    };
  }

  /**
   * Get delivery status for a mission
   */
  static async getDeliveryStatus(missionId: string, userId: string, userRole: string) {
    const mission = await Mission.findByPk(missionId, {
      include: [
        { model: User, as: 'technician', attributes: ['id', 'full_name'] },
        { model: User, as: 'driver', attributes: ['id', 'full_name'] },
        { model: Equipment, attributes: ['id', 'name'] },
      ],
    });

    if (!mission) {
      throw new Error('Mission not found');
    }

    // Check authorization
    if (userRole !== 'admin' && mission.technician_id !== userId && mission.driver_id !== userId) {
      throw new Error('You are not authorized to view this delivery status');
    }

    const delivery = await Delivery.findOne({
      where: { mission_id: missionId },
    });

    return {
      missionId: mission.id,
      title: mission.title,
      status: mission.status,
      qrCode: mission.qr_code,
      scans: {
        driver: {
          scanned: !!mission.driver_scanned_at,
          timestamp: mission.driver_scanned_at,
          latitude: delivery?.driver_scan_lat,
          longitude: delivery?.driver_scan_lng,
        },
        technician: {
          scanned: !!mission.technician_scanned_at,
          timestamp: mission.technician_scanned_at,
          latitude: delivery?.technician_scan_lat,
          longitude: delivery?.technician_scan_lng,
        },
      },
      deliveredAt: mission.delivered_at,
    };
  }
}