import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import  sequelize  from '../config/database.js';

interface DeliveryAttributes {
  id: string;
  mission_id: string;
  driver_id: string;
  technician_id: string;
  qr_code_scanned: string;
  driver_scan_lat?: number;
  driver_scan_lng?: number;
  technician_scan_lat?: number;
  technician_scan_lng?: number;
  driver_scanned_at: Date;
  technician_scanned_at: Date;
  delivered_at: Date;
  delivery_photo_url?: string;
  signature_url?: string;
  notes?: string;
  created_at?: Date;
}

type DeliveryCreationAttributes = Optional<DeliveryAttributes, 'id' | 'created_at' | 'driver_scan_lat' | 'driver_scan_lng' | 'technician_scan_lat' | 'technician_scan_lng' | 'delivery_photo_url' | 'signature_url' | 'notes'>;

class Delivery extends Model<DeliveryAttributes, DeliveryCreationAttributes> implements DeliveryAttributes {
  public id!: string;
  public mission_id!: string;
  public driver_id!: string;
  public technician_id!: string;
  public qr_code_scanned!: string;
  public driver_scan_lat?: number;
  public driver_scan_lng?: number;
  public technician_scan_lat?: number;
  public technician_scan_lng?: number;
  public driver_scanned_at!: Date;
  public technician_scanned_at!: Date;
  public delivered_at!: Date;
  public delivery_photo_url?: string;
  public signature_url?: string;
  public notes?: string;
  public created_at!: Date;
}

Delivery.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  mission_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'missions',
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
  technician_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  qr_code_scanned: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  driver_scan_lat: DataTypes.DECIMAL(10, 8),
  driver_scan_lng: DataTypes.DECIMAL(11, 8),
  technician_scan_lat: DataTypes.DECIMAL(10, 8),
  technician_scan_lng: DataTypes.DECIMAL(11, 8),
  driver_scanned_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  technician_scanned_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivery_photo_url: DataTypes.STRING,
  signature_url: DataTypes.STRING,
  notes: DataTypes.TEXT
}, {
  sequelize,
  tableName: 'deliveries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default Delivery;