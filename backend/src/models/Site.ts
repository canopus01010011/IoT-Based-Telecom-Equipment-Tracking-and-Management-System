import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import  sequelize  from '../config/database.js';
import { generateCode } from '../utils/idGenerator.js';

interface SiteAttributes {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  route?: string;
  created_at?: Date;
}

type SiteCreationAttributes = Optional<SiteAttributes, 'id' | 'created_at' | 'route'>;

class Site extends Model<SiteAttributes, SiteCreationAttributes> implements SiteAttributes {
  public id!: string;
  public name!: string;
  public address!: string;
  public latitude!: number;
  public longitude!: number;
  public route?: string;
  public created_at!: Date;
}

Site.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: () => generateCode('STE'),
    field: 'site_id',
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    field: 'site_name',
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    field: 'site_address',
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    field: 'site_latitude',
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    field: 'site_longitude',
    allowNull: false
  },
  route: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  sequelize,
  tableName: 'sites',
  timestamps: true,
  createdAt: 'site_creation_date',
  updatedAt: false
});

export default Site;
