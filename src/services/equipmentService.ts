import { Equipment } from '../models/index.js';
import { Op } from 'sequelize';

export class EquipmentService {
  static async createEquipment(data: any) {
    return await Equipment.create({
    ...data,
    quantity: data.quantity || 1,  // ✅ Ensure quantity is set
  });
  }

  static async getAllEquipment(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query.search}%` } },
        { serial_number: { [Op.iLike]: `%${query.search}%` } },
      ];
    }
    const { count, rows } = await Equipment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    return {
      equipment: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    };
  }

  static async getEquipmentById(id: string) {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) throw new Error('Equipment not found');
    return equipment;
  }

  static async updateEquipment(id: string, data: any, userRole: string) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const equipment = await Equipment.findByPk(id);
    if (!equipment) throw new Error('Equipment not found');
    await equipment.update(data);
    return equipment;
  }

  static async deleteEquipment(id: string, userRole: string) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const equipment = await Equipment.findByPk(id);
    if (!equipment) throw new Error('Equipment not found');
    await equipment.destroy();
    return true;
  }
}