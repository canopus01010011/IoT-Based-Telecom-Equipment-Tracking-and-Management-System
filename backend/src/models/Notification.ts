import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface NotificationAttributes {
  id: string;
  user_id?: string;
  role_target?: 'all' | 'admin' | 'technician' | 'driver';
  title: string;
  body: string;
  data?: any;
  is_read: boolean;
  sent_at: Date;
  delivered_at?: Date;
  created_at?: Date;
}

type NotificationCreationAttributes = Optional<NotificationAttributes, 'id' | 'created_at' | 'user_id' | 'role_target' | 'data' | 'delivered_at' | 'is_read'>;

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: string;
  public user_id?: string;
  public role_target?: 'all' | 'admin' | 'technician' | 'driver';
  public title!: string;
  public body!: string;
  public data?: any;
  public is_read!: boolean;
  public sent_at!: Date;
  public delivered_at?: Date;
  public created_at!: Date;
}

Notification.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  role_target: {
    type: DataTypes.ENUM('all', 'admin', 'technician', 'driver')
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  delivered_at: DataTypes.DATE
}, {
  sequelize,
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id', 'is_read']
    },
    {
      fields: ['sent_at']
    }
  ]
});

export default Notification;