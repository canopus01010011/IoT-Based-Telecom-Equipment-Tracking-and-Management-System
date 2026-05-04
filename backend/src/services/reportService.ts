import { Mission, User, Equipment } from '../models/index.js';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';

export class ReportService {
  /**
   * Get mission report with filters
   */
  static async getMissionReport(filters: any, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    const where: any = {};

    // Apply filters
    if (filters.startDate && filters.endDate) {
      where.started_at = { [Op.between]: [filters.startDate, filters.endDate] };
    }
    if (filters.status) where.status = filters.status;
    if (filters.technicianId) where.technician_id = filters.technicianId;
    if (filters.driverId) where.driver_id = filters.driverId;
    if (filters.equipmentId) where.equipment_id = filters.equipmentId;

    // Get missions with simple includes
    const { count, rows } = await Mission.findAndCountAll({
      where,
      include: [
        { model: User, as: 'technician', attributes: ['id', 'full_name'] },
        { model: User, as: 'driver', attributes: ['id', 'full_name'] },
        { model: Equipment, attributes: ['id', 'name'] },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    // Simple statistics - using correct status values
    const delivered = rows.filter(m => m.status === 'delivered').length;
    const cancelled = rows.filter(m => m.status === 'cancelled').length;
    const pending = rows.filter(m => m.status === 'pending').length;

    return {
      missions: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      summary: {
        total: count,
        delivered,
        cancelled,
        pending,
        deliveryRate: count > 0 ? ((delivered / count) * 100).toFixed(1) : 0,
      },
    };
  }

  /**
   * Export missions to Excel
   */
  static async exportMissionsToExcel(filters: any): Promise<Buffer> {
    const { missions } = await this.getMissionReport(filters, 1, 10000);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Missions');

    // Headers
    worksheet.addRow(['ID', 'Title', 'Status', 'Priority', 'Technician', 'Driver', 'Equipment', 'Created At', 'Delivered At']);
    
    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

    // Add data
    for (const mission of missions) {
      worksheet.addRow([
        mission.id,
        mission.title,
        mission.status,
        mission.priority,
        (mission as any).technician?.full_name || 'N/A',
        (mission as any).driver?.full_name || 'N/A',
        (mission as any).equipment?.name || 'N/A',
        mission.created_at?.toISOString().split('T')[0],
        mission.delivered_at?.toISOString().split('T')[0] || 'Pending',
      ]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}