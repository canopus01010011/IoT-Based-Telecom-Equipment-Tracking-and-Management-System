import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize  from '../config/database.js';

interface GPSLogAttributes {
  id: string;
  equipment_id: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: Date;
  created_at?: Date;
}

type GPSLogCreationAttributes = Optional<GPSLogAttributes, 'id' | 'created_at' | 'speed' | 'heading' | 'accuracy'>;

class GPSLog extends Model<GPSLogAttributes, GPSLogCreationAttributes> implements GPSLogAttributes {
  public id!: string;
  public equipment_id!: string;
  public latitude!: number;
  public longitude!: number;
  public speed?: number;
  public heading?: number;
  public accuracy?: number;
  public timestamp!: Date;
  public created_at!: Date;
}

GPSLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  equipment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'equipment',
      key: 'id'
    }
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  speed: DataTypes.DECIMAL(5, 2),
  heading: DataTypes.DECIMAL(5, 2),
  accuracy: DataTypes.DECIMAL(5, 2),
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'gps_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['equipment_id', 'timestamp']
    }
  ]
});

export default GPSLog;