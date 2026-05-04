import { Mission, Equipment, Site, User } from '../models/index.js';
import { Op } from 'sequelize';

export class MissionService {
  static async createMission(data: any, userId: string) {
    const mission = await Mission.create({
      ...data,
      status: 'pending',
      created_by: userId,
      quantity: data.quantity || 1,  // ✅ Ensure quantity is set
      
    });
    if (data.equipment_id) {
      await Equipment.update(
        { status: 'in_use' },
        { where: { id: data.equipment_id } }
      );
    }
    return mission;
  }

  static async getAllMissions(query: any, userRole: string, userId: string) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;
    const where: any = {};

    if (userRole === 'technician') where.technician_id = userId;
    else if (userRole === 'driver') where.driver_id = userId;

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;

    const { count, rows } = await Mission.findAndCountAll({
      where,
      include: [
        { model: User, as: 'technician', attributes: ['id', 'full_name', 'email'] },
        { model: User, as: 'driver', attributes: ['id', 'full_name', 'email'] },
        { model: Equipment, attributes: ['id', 'name', 'serial_number'] },
        { model: Site, attributes: ['id', 'name', 'address'] },
      ],
      limit,
      offset,
      order: [['started_at', 'ASC']],
    });
    return {
      missions: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    };
  }

  static async getMissionById(id: string, userRole: string, userId: string) {
    const mission = await Mission.findByPk(id, {
      include: [
        { model: User, as: 'technician' },
        { model: User, as: 'driver' },
        { model: Equipment },
        { model: Site },
      ],
    });
    if (!mission) throw new Error('Mission not found');
    if (userRole !== 'admin' && mission.technician_id !== userId && mission.driver_id !== userId) {
      throw new Error('Forbidden');
    }
    return mission;
  }

  static async updateMission(id: string, data: any, userRole: string) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const mission = await Mission.findByPk(id);
    if (!mission) throw new Error('Mission not found');
    await mission.update(data);
    return mission;
  }

  static async deleteMission(id: string, userRole: string) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const mission = await Mission.findByPk(id);
    if (!mission) throw new Error('Mission not found');
    await mission.destroy();
    return true;
  }

  static async updateStatus(id: string, status: string, userRole: string, userId: string) {
    const mission = await Mission.findByPk(id);
    if (!mission) throw new Error('Mission not found');
    if (userRole !== 'admin' && mission.technician_id !== userId && mission.driver_id !== userId) {
      throw new Error('Forbidden');
    }
    const allowed: Record<string, string[]> = {
      pending: ['in_transit'],
      in_transit: ['driver_scanned', 'cancelled'],
      driver_scanned: ['delivered'],
      delivered: ['completed'],
      completed: [],
      cancelled: [],
    };
    if (!allowed[mission.status]?.includes(status)) {
      throw new Error(`Invalid status transition from ${mission.status} to ${status}`);
    }
    await mission.update({status: status as any});
    return mission;
  }
}