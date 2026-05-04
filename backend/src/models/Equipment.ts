import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface EquipmentAttributes {
  id: string;
  name: string;
  type: string;
  serial_number: string;
  status: 'available' | 'in_use' | 'maintenance' | 'lost';
  quantity: number;  // ✅ ADD THIS - total available units
  device_id?: string;
  current_latitude?: number;
  current_longitude?: number;
  last_gps_update?: Date;
  site_id?: string;
  avatar_url?: string;  // 
  created_at?: Date;
  updated_at?: Date;
}

type EquipmentCreationAttributes = Optional<EquipmentAttributes, 
  'id' | 'created_at' | 'updated_at' | 'device_id' | 'current_latitude' | 
  'current_longitude' | 'last_gps_update' | 'site_id' | 'avatar_url'  // ✅ ADD avatar_url
>;

class Equipment extends Model<EquipmentAttributes, EquipmentCreationAttributes> implements EquipmentAttributes {
  public id!: string;
  public name!: string;
  public type!: string;
  public serial_number!: string;
  public status!: 'available' | 'in_use' | 'maintenance' | 'lost';
  public quantity!: number;  // ✅ ADD THIS
  public device_id?: string;
  public current_latitude?: number;
  public current_longitude?: number;
  public last_gps_update?: Date;
  public site_id?: string;
  public avatar_url?: string;  //
  public created_at!: Date;
  public updated_at!: Date;
}

Equipment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  serial_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'lost'),
    allowNull: false,
    defaultValue: 'available'
  },
  quantity: {  // ✅ ADD THIS
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  device_id: {
    type: DataTypes.STRING,
    unique: true
  },
  current_latitude: {
    type: DataTypes.DECIMAL(10, 8)
  },
  current_longitude: {
    type: DataTypes.DECIMAL(11, 8)
  },
  last_gps_update: {
    type: DataTypes.DATE
  },
  site_id: {
    type: DataTypes.UUID,
    references: {
      model: 'sites',
      key: 'id'
    }
  },
  avatar_url: {  //  stores Cloudinary URL
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'equipment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Equipment;