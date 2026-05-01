import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import  sequelize from '../config/database.js';

interface MissionAttributes {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_transit' | 'driver_scanned' | 'delivered' | 'cancelled' ;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  technician_id: string;
  driver_id: string;
  equipment_id: string;
  quantity: number;  // ✅ ADD THIS - how many units to deliver
  site_id: string;
  qr_code: string;
  started_at?: Date;
  driver_scanned_at?: Date;
  technician_scanned_at?: Date;
  delivered_at?: Date;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

type MissionCreationAttributes = Optional<MissionAttributes, 'id' | 'created_at' | 'updated_at' | 'started_at' | 'driver_scanned_at' | 'technician_scanned_at' | 'delivered_at'>;

class Mission extends Model<MissionAttributes, MissionCreationAttributes> implements MissionAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public status!: 'pending' | 'in_transit' | 'driver_scanned' | 'delivered' | 'cancelled';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public technician_id!: string;
  public driver_id!: string;
  public equipment_id!: string;
  public quantity!: number;  // ✅ ADD THIS
  public site_id!: string;
  public qr_code!: string;
  public started_at?: Date;
  public driver_scanned_at?: Date;
  public technician_scanned_at?: Date;
  public delivered_at?: Date;
  public created_by!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Mission.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_transit', 'driver_scanned', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  technician_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  driver_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  equipment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'equipment',
      key: 'id'
    }
  },
  quantity: {  // ✅ ADD THIS
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  site_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sites',
      key: 'id'
    }
  },
  qr_code: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  started_at: DataTypes.DATE,
  driver_scanned_at: DataTypes.DATE,
  technician_scanned_at: DataTypes.DATE,
  delivered_at: DataTypes.DATE,
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  sequelize,
  tableName: 'missions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Mission;