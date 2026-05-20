import sequelize from '../config/database.js';
import { User, Site, Container, GPSDevice, Mission, TrackingData } from '../models/index.js';

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to the database to seed...');
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    // 1. Clean up existing records in reverse dependency order
    console.log('🧹 Clearing old database records...');
    await TrackingData.destroy({ where: {} });
    await Mission.destroy({ where: {} });
    await GPSDevice.destroy({ where: {} });
    await Container.destroy({ where: {} });
    await Site.destroy({ where: {} });
    await User.destroy({ where: {} });
    console.log('✅ Old database records cleared.');

    // 2. Seed Users
    console.log('🌱 Seeding Users...');
    const users = await User.bulkCreate([
      {
        id: 'USR-ADMIN',
        email: 'admin@erctrac.dz',
        password_hash: 'admin123', // Will be hashed automatically by beforeCreate hook
        full_name: 'Admin User',
        role: 'admin',
        phone: '0550112233',
      },
      {
        id: 'USR-DRV001',
        email: 'k.benali@erctrac.dz',
        password_hash: 'driver123',
        full_name: 'K. Benali',
        role: 'driver',
        phone: '0550445566',
      },
      {
        id: 'USR-DRV002',
        email: 'm.saadi@erctrac.dz',
        password_hash: 'driver123',
        full_name: 'M. Saadi',
        role: 'driver',
        phone: '0550445567',
      },
      {
        id: 'USR-DRV003',
        email: 'o.meziane@erctrac.dz',
        password_hash: 'driver123',
        full_name: 'O. Meziane',
        role: 'driver',
        phone: '0550445568',
      },
      {
        id: 'USR-TEC001',
        email: 'a.hamid@erctrac.dz',
        password_hash: 'tech123',
        full_name: 'A. Hamid',
        role: 'technician',
        phone: '0550778899',
      },
      {
        id: 'USR-TEC002',
        email: 'y.brahim@erctrac.dz',
        password_hash: 'tech123',
        full_name: 'Y. Brahim',
        role: 'technician',
        phone: '0550778890',
      },
      {
        id: 'USR-TEC003',
        email: 'n.oukil@erctrac.dz',
        password_hash: 'tech123',
        full_name: 'N. Oukil',
        role: 'technician',
        phone: '0550778891',
      },
    ], { validate: true, individualHooks: true });
    console.log(`✅ Seeded ${users.length} Users.`);

    // 3. Seed Sites
    console.log('🌱 Seeding Sites...');
    const site = await Site.create({
      id: 'STE-ALGER',
      name: 'BTS Bab Ezzouar',
      address: 'Bab Ezzouar, Alger, Algérie',
      latitude: 36.7372,
      longitude: 3.1897,
    });
    console.log('✅ Seeded Site: BTS Bab Ezzouar.');

    // 4. Seed Containers
    console.log('🌱 Seeding Containers...');
    const containers = await Container.bulkCreate([
      { id: 'CTR-001', qr_code: 'CTR-QR-001', capacity: 150, status: 'in_transit' },
      { id: 'CTR-002', qr_code: 'CTR-QR-002', capacity: 150, status: 'in_transit' },
      { id: 'CTR-003', qr_code: 'CTR-QR-003', capacity: 150, status: 'in_transit' },
    ]);
    console.log(`✅ Seeded ${containers.length} Containers.`);

    // 5. Seed GPS Devices mapping to Containers and IoT simulator deviceIDs
    console.log('🌱 Seeding GPS Devices...');
    const gpsDevices = await GPSDevice.bulkCreate([
      {
        id: 'GPS-001',
        container_id: 'CTR-001',
        device_serial_number: 'package_001',
        battery_level: 100,
        device_status: 'active',
      },
      {
        id: 'GPS-002',
        container_id: 'CTR-002',
        device_serial_number: 'package_002',
        battery_level: 100,
        device_status: 'active',
      },
      {
        id: 'GPS-003',
        container_id: 'CTR-003',
        device_serial_number: 'package_003',
        battery_level: 100,
        device_status: 'active',
      },
    ]);
    console.log(`✅ Seeded ${gpsDevices.length} GPS Devices.`);

    // 6. Seed Missions
    console.log('🌱 Seeding Missions...');
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const missions = await Mission.bulkCreate([
      {
        id: 'MIS-091',
        status: 'in-progress',
        scheduled_start_date: today,
        scheduled_end_date: tomorrow,
        start_date: today,
        driver_id: 'USR-DRV001',
        technician_id: 'USR-TEC001',
        container_id: 'CTR-001',
        site_id: 'STE-ALGER',
        equipment_list: [],
      },
      {
        id: 'MIS-090',
        status: 'in-progress',
        scheduled_start_date: today,
        scheduled_end_date: tomorrow,
        start_date: today,
        driver_id: 'USR-DRV002',
        technician_id: 'USR-TEC002',
        container_id: 'CTR-002',
        site_id: 'STE-ALGER',
        equipment_list: [],
      },
      {
        id: 'MIS-089',
        status: 'in-progress',
        scheduled_start_date: today,
        scheduled_end_date: tomorrow,
        start_date: today,
        driver_id: 'USR-DRV003',
        technician_id: 'USR-TEC003',
        container_id: 'CTR-003',
        site_id: 'STE-ALGER',
        equipment_list: [],
      },
    ]);
    console.log(`✅ Seeded ${missions.length} Missions.`);

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
