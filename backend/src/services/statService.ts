import { Mission, User, Equipment } from '../models/index.js';
import { Op } from 'sequelize';

export class StatService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    // Get all counts
    const totalMissions = await Mission.count();
    const totalTechnicians = await User.count({ where: { role: 'technician' } });
    const totalDrivers = await User.count({ where: { role: 'driver' } });
    const totalEquipment = await Equipment.count();

    // Mission status counts - USING CORRECT ENUM VALUES
    const completedMissions = await Mission.count({ 
      where: { status: 'delivered' }  // ✅ 'delivered' not 'completed'
    });
    const pendingMissions = await Mission.count({ where: { status: 'pending' } });
    const cancelledMissions = await Mission.count({ where: { status: 'cancelled' } });
    const inTransitMissions = await Mission.count({ where: { status: 'in_transit' } });
    const driverScannedMissions = await Mission.count({ where: { status: 'driver_scanned' } });

    // Equipment status counts
    const equipmentInUse = await Equipment.count({ where: { status: 'in_use' } });
    const equipmentAvailable = await Equipment.count({ where: { status: 'available' } });

    // This month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const missionsThisMonth = await Mission.count({
      where: { created_at: { [Op.gte]: startOfMonth } },
    });

    return {
      totalMissions,
      totalTechnicians,
      totalDrivers,
      totalEquipment,
      completedMissions,      // delivered missions
      pendingMissions,
      cancelledMissions,
      inTransitMissions,
      driverScannedMissions,
      equipmentInUse,
      equipmentAvailable,
      missionsThisMonth,
      completionRate: totalMissions > 0 
        ? ((completedMissions / totalMissions) * 100).toFixed(1) 
        : 0,
    };
  }

  /**
   * Get missions per day for chart
   */
  static async getMissionsPerDay(days: number = 30) {
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const count = await Mission.count({
        where: {
          created_at: {
            [Op.gte]: date,
            [Op.lt]: nextDate,
          },
        },
      });
      
      result.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }
    
    return result;
  }

  /**
   * Get top technicians by completed missions (delivered status)
   */
  static async getTopTechnicians(limit: number = 5) {
    const technicians = await User.findAll({
      where: { role: 'technician' },
      attributes: ['id', 'full_name'],
    });

    const result = [];
    
    for (const tech of technicians) {
      const completedCount = await Mission.count({
        where: {
          technician_id: tech.id,
          status: 'delivered',  // ✅ 'delivered' not 'completed'
        },
      });
      
      result.push({
        id: tech.id,
        name: tech.full_name,
        completedMissions: completedCount,
      });
    }
    
    return result.sort((a, b) => b.completedMissions - a.completedMissions).slice(0, limit);
  }

  /**
   * Get top drivers by missions completed (delivered status)
   */
  static async getTopDrivers(limit: number = 5) {
    const drivers = await User.findAll({
      where: { role: 'driver' },
      attributes: ['id', 'full_name'],
    });

    const result = [];
    
    for (const driver of drivers) {
      const missionCount = await Mission.count({
        where: {
          driver_id: driver.id,
          status: 'delivered',  // ✅ 'delivered' not 'completed'
        },
      });
      
      result.push({
        id: driver.id,
        name: driver.full_name,
        completedMissions: missionCount,
      });
    }
    
    return result.sort((a, b) => b.completedMissions - a.completedMissions).slice(0, limit);
  }

  /**
   * Get popular equipment
   */
  static async getPopularEquipment(limit: number = 5) {
    const equipment = await Equipment.findAll({
      attributes: ['id', 'name', 'type'],
    });

    const result = [];
    
    for (const item of equipment) {
      const usageCount = await Mission.count({
        where: { equipment_id: item.id },
      });
      
      result.push({
        id: item.id,
        name: item.name,
        type: item.type,
        timesUsed: usageCount,
      });
    }
    
    return result.sort((a, b) => b.timesUsed - a.timesUsed).slice(0, limit);
  }
}