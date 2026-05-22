import { Mission, Report, Site, User } from '../models/index.js';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';

export class ReportService {
  static async getMissionReport(filters: any, page: number = 1, limit: number = 0) {
    const offset = limit > 0 ? (page - 1) * limit : 0;
    const where: any = {};

    if (filters.startDate && filters.endDate) {
      where.start_date = { [Op.between]: [filters.startDate, filters.endDate] };
    }
    if (filters.status) where.status = filters.status;
    if (filters.technicianId) where.technician_id = filters.technicianId;
    if (filters.driverId) where.driver_id = filters.driverId;

    // Only return completed missions that have a report
    where.status = 'completed';

    const { count, rows } = await Mission.findAndCountAll({
      where,
      include: [
        { model: User, as: 'technician', attributes: ['id', 'full_name', 'phone'] },
        { model: User, as: 'driver', attributes: ['id', 'full_name', 'phone'] },
        { model: Site, attributes: ['id', 'name', 'latitude', 'longitude'] },
        { model: Report, required: true, attributes: ['id', 'description', 'notes', 'delivery_photo_url', 'report_date'] },
      ],
      ...(limit > 0 ? { limit, offset } : {}),
      order: [['creation_date', 'DESC']],
    });

    return {
      missions: rows,
      total: count,
      page,
      totalPages: limit > 0 ? Math.ceil(count / limit) : 1,
      summary: {
        total: count,
        completed: count,
      },
    };
  }

  static async exportMissionsToExcel(filters: any): Promise<Buffer> {
    const { missions } = await this.getMissionReport(filters, 1, 10000);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Missions');

    worksheet.addRow(['ID', 'Status', 'Technician', 'Driver', 'Equipment List', 'Scheduled Start', 'Start Date', 'End Date']);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

    for (const mission of missions) {
      worksheet.addRow([
        mission.id,
        mission.status,
        (mission as any).technician?.full_name || 'N/A',
        (mission as any).driver?.full_name || 'N/A',
        (mission as any).equipment_list?.map((e: any) => `${e.equipment_id} (x${e.quantity})`).join(', ') || 'None',
        mission.scheduled_start_date?.toISOString().split('T')[0] || 'N/A',
        mission.start_date?.toISOString().split('T')[0] || 'N/A',
        mission.end_date?.toISOString().split('T')[0] || 'Pending',
      ]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
