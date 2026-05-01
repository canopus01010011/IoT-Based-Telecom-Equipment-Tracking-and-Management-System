import User from './User.js';
import Site from './Site.js';
import Equipment from './Equipment.js';
import Mission from './Mission.js';
import GPSLog from './GPSLog.js';
import Delivery from './Delivery.js';
import Notification from './Notification.js';

// User associations
User.hasMany(Mission, { as: 'missions_as_technician', foreignKey: 'technician_id' });
User.hasMany(Mission, { as: 'missions_as_driver', foreignKey: 'driver_id' });
User.hasMany(Mission, { as: 'missions_created', foreignKey: 'created_by' });
User.hasMany(Delivery, { as: 'deliveries_as_driver', foreignKey: 'driver_id' });
User.hasMany(Delivery, { as: 'deliveries_as_technician', foreignKey: 'technician_id' });
User.hasMany(Notification, { foreignKey: 'user_id' });

// Site associations
Site.hasMany(Mission, { foreignKey: 'site_id' });
Site.hasMany(Equipment, { foreignKey: 'site_id' });

// Equipment associations
Equipment.hasMany(Mission, { foreignKey: 'equipment_id' });
Equipment.hasMany(GPSLog, { foreignKey: 'equipment_id' });
Equipment.belongsTo(Site, { foreignKey: 'site_id' });

// Mission associations
Mission.belongsTo(User, { as: 'technician', foreignKey: 'technician_id' });
Mission.belongsTo(User, { as: 'driver', foreignKey: 'driver_id' });
Mission.belongsTo(Equipment, { foreignKey: 'equipment_id' });
Mission.belongsTo(Site, { foreignKey: 'site_id' });
Mission.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Mission.hasOne(Delivery, { foreignKey: 'mission_id' });

// GPSLog associations
GPSLog.belongsTo(Equipment, { foreignKey: 'equipment_id' });

// Delivery associations
Delivery.belongsTo(Mission, { foreignKey: 'mission_id' });
Delivery.belongsTo(User, { as: 'driver', foreignKey: 'driver_id' });
Delivery.belongsTo(User, { as: 'technician', foreignKey: 'technician_id' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id' });

export {
  User,
  Site,
  Equipment,
  Mission,
  GPSLog,
  Delivery,
  Notification
};