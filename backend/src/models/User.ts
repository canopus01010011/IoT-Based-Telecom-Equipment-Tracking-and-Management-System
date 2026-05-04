import { Model, DataTypes } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

interface UserAttributes {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'technician' | 'driver';
  phone: string;
  avatar_url?: string;
  is_active: boolean;
  fcm_token?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at' | 'avatar_url' | 'fcm_token'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password_hash!: string;
  public full_name!: string;
  public role!: 'admin' | 'technician' | 'driver';
  public phone!: string;
  public avatar_url?: string;
  public is_active!: boolean;
  public fcm_token?: string;
  public created_at!: Date;
  public updated_at!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password_hash);
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'technician', 'driver'),
    allowNull: false,
    defaultValue: 'technician'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar_url: {
    type: DataTypes.STRING
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fcm_token: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user: User) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    },
    beforeUpdate: async (user: User) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

export default User;