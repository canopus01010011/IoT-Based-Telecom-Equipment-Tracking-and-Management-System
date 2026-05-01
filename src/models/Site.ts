import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import  sequelize  from '../config/database.js';

interface SiteAttributes {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_person: string;
  contact_phone: string;
  created_at?: Date;
  updated_at?: Date;
}

type SiteCreationAttributes = Optional<SiteAttributes, 'id' | 'created_at' | 'updated_at'>;

class Site extends Model<SiteAttributes, SiteCreationAttributes> implements SiteAttributes {
  public id!: string;
  public name!: string;
  public address!: string;
  public latitude!: number;
  public longitude!: number;
  public contact_person!: string;
  public contact_phone!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Site.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  contact_person: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact_phone: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'sites',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Site;