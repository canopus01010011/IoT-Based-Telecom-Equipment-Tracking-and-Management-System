import { Op } from 'sequelize';
import { Confirmation, Container, GPSDevice, Mission, Report, Site, User } from '../models/index.js';
import { NotificationService } from './notificationService.js';
import axios from 'axios';

const IOT_BASE_URL = process.env.IOT_BASE_URL || 'https://iot-based-telecom-equipment-tracking-and-managem-production.up.railway.app';

async function getAdminIds(): Promise<string[]> {
  const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
  return admins.map(u => u.id);
}

interface ScanData {
  missionId: string;
  userId: string;
  userRole: 'admin' | 'technician' | 'driver';
}

export class DeliveryService {
  static async resolveMissionIdFromQr(
    qrCode: string,
    userId: string,
    userRole: string,
  ): Promise<string> {
    const container = await Container.findOne({
      where: {
        [Op.or]: [{ qr_code: qrCode }, { id: qrCode }],
      },
    });

    if (!container) {
      throw new Error('Invalid QR code: container not found');
    }

    const missionWhere: Record<string, unknown> = {
      container_id: container.id,
      status: { [Op.ne]: 'completed' },
    };

    if (userRole === 'driver') {
      missionWhere.driver_id = userId;
    } else if (userRole === 'technician') {
      missionWhere.technician_id = userId;
    }

    const mission = await Mission.findOne({
      where: missionWhere,
      order: [['scheduled_start_date', 'DESC']],
    });

    if (!mission) {
      throw new Error('Invalid QR code: no active mission for this container');
    }

    return mission.id;
  }

  static async processScan(data: ScanData) {
    const { missionId, userId, userRole } = data;

    const mission = await Mission.findByPk(missionId, {
      include: [
        { model: User, as: 'technician' },
        { model: User, as: 'driver' },
      ],
    });

    if (!mission) throw new Error('Mission not found');
    if (mission.status === 'completed') throw new Error('Mission already completed');

    if (userRole === 'driver') {
      return this.handleDriverConfirmation(mission, userId);
    }

    if (userRole === 'technician') {
      return this.handleTechnicianConfirmation(mission, userId);
    }

    throw new Error('Only drivers and technicians can confirm missions');
  }

  private static async handleDriverConfirmation(mission: Mission, driverId: string) {
    if (mission.driver_id !== driverId) {
      throw new Error('You are not assigned as driver for this mission');
    }

    const [confirmation, created] = await Confirmation.findOrCreate({
      where: { mission_id: mission.id },
      defaults: {
        mission_id: mission.id,
        driver_confirm_time: new Date(),
        confirmation_status: 'driver_confirmed',
      },
    });

    if (!created && confirmation.driver_confirm_time) {
      throw new Error('Driver already confirmed this mission');
    }

    await confirmation.update({
      driver_confirm_time: new Date(),
      confirmation_status: 'driver_confirmed',
    });
    await mission.update({ status: 'in-progress', start_date: new Date() });

    // Trigger IoT GPS simulation for this mission's container
    if (mission.container_id) {
      (async () => {
        try {
          const gpsDevice = await GPSDevice.findOne({
            where: { container_id: mission.container_id },
          });
          if (gpsDevice) {
            await axios.post(`${IOT_BASE_URL}/simulation/start/${gpsDevice.device_serial_number}`, {}, { timeout: 5000 });
            console.log(`IoT simulation started for device ${gpsDevice.device_serial_number}`);
          }
        } catch (err: any) {
          console.error(`Failed to trigger IoT simulation for ${mission.id}:`, err.message);
        }
      })();
    }

    const reloaded = await Mission.findByPk(mission.id, {
      include: [
        { model: User, as: 'driver', attributes: ['full_name'] },
        { model: Site, attributes: ['name'] },
      ],
    });
    const adminIds = await getAdminIds();
    const driverName = ((reloaded as any)?.driver as any)?.full_name || '';
    const siteName = ((reloaded as any)?.Site as any)?.name || '';
    const body = `${driverName} · ${mission.container_id || ''} · ${siteName} · ${mission.id}`;
    NotificationService.send(
      [...new Set([...adminIds, mission.technician_id].filter(Boolean))],
      'departure',
      body,
      { missionId: mission.id },
    );

    return {
      success: true,
      missionId: mission.id,
      message: 'Driver confirmation recorded. Waiting for technician confirmation.',
      status: mission.status,
      nextStep: 'technician_confirmation_required',
    };
  }

  private static async handleTechnicianConfirmation(mission: Mission, technicianId: string) {
    if (mission.technician_id !== technicianId) {
      throw new Error('You are not assigned as technician for this mission');
    }

    const confirmation = await Confirmation.findOne({ where: { mission_id: mission.id } });
    if (!confirmation?.driver_confirm_time) {
      throw new Error('Driver must confirm before technician');
    }
    if (confirmation.technician_confirm_time) {
      throw new Error('Technician already confirmed this mission');
    }

    // Stop IoT GPS simulation for this mission's container
    if (mission.container_id) {
      (async () => {
        try {
          const gpsDevice = await GPSDevice.findOne({
            where: { container_id: mission.container_id },
          });
          if (gpsDevice) {
            await axios.post(`${IOT_BASE_URL}/simulation/stop/${gpsDevice.device_serial_number}`, {}, { timeout: 5000 });
            console.log(`IoT simulation stopped for device ${gpsDevice.device_serial_number}`);
          }
        } catch (err: any) {
          console.error(`Failed to stop IoT simulation for ${mission.id}:`, err.message);
        }
      })();
    }

    await confirmation.update({
      technician_confirm_time: new Date(),
      confirmation_status: 'confirmed',
    });
    await mission.update({ status: 'completed', end_date: new Date() });

    await Report.findOrCreate({
      where: { mission_id: mission.id },
      defaults: {
        mission_id: mission.id,
        report_date: new Date(),
        description: 'Mission completed',
        delivery_photo_url: [],
      },
    });

    const reloaded = await Mission.findByPk(mission.id, {
      include: [
        { model: User, as: 'technician', attributes: ['full_name'] },
        { model: User, as: 'driver', attributes: ['full_name'] },
        { model: Site, attributes: ['name'] },
      ],
    });
    const adminIds = await getAdminIds();
    const techName = ((reloaded as any)?.technician as any)?.full_name || '';
    const driverName = ((reloaded as any)?.driver as any)?.full_name || '';
    const siteName = ((reloaded as any)?.Site as any)?.name || '';
    const body = `${techName || driverName} · ${siteName} · ${mission.id}`;
    NotificationService.send(
      [...new Set([...adminIds, mission.technician_id, mission.driver_id].filter(Boolean))],
      'completed',
      body,
      { missionId: mission.id },
    );

    return {
      success: true,
      missionId: mission.id,
      message: 'Mission confirmed successfully.',
      status: mission.status,
      completedAt: mission.end_date,
    };
  }

  static async getDeliveryStatus(missionId: string, userId: string, userRole: string) {
    const mission = await Mission.findByPk(missionId, {
      include: [
        { model: User, as: 'technician', attributes: ['id', 'full_name'] },
        { model: User, as: 'driver', attributes: ['id', 'full_name'] },
      ],
    });

    if (!mission) throw new Error('Mission not found');
    if (userRole !== 'admin' && mission.technician_id !== userId && mission.driver_id !== userId) {
      throw new Error('You are not authorized to view this delivery status');
    }

    const confirmation = await Confirmation.findOne({ where: { mission_id: missionId } });
    const report = await Report.findOne({ where: { mission_id: missionId } });

    return {
      missionId: mission.id,
      status: mission.status,
      confirmation: {
        driver: {
          confirmed: !!confirmation?.driver_confirm_time,
          timestamp: confirmation?.driver_confirm_time,
        },
        technician: {
          confirmed: !!confirmation?.technician_confirm_time,
          timestamp: confirmation?.technician_confirm_time,
        },
        status: confirmation?.confirmation_status || 'pending',
      },
      completedAt: mission.end_date,
      report,
    };
  }
}
