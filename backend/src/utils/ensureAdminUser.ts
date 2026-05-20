import bcrypt from 'bcrypt';
import sequelize from '../config/database.js';
import { User } from '../models/index.js';

const adminEmail = process.env.ADMIN_EMAIL || 'admin@erctrac.dz';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

async function ensureAdminUser() {
  try {
    await sequelize.authenticate();

    const password_hash = await bcrypt.hash(adminPassword, 10);
    const [user, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        id: 'USR-ADMIN',
        email: adminEmail,
        password_hash,
        full_name: process.env.ADMIN_FULL_NAME || 'Admin User',
        role: 'admin',
        phone: process.env.ADMIN_PHONE || '0550112233',
      },
      hooks: false,
    });

    if (!created) {
      await user.update({
        password_hash,
        full_name: user.full_name || process.env.ADMIN_FULL_NAME || 'Admin User',
        role: 'admin',
        phone: user.phone || process.env.ADMIN_PHONE || '0550112233',
      }, { hooks: false });
    }

    console.log(`${created ? 'Created' : 'Updated'} admin user: ${adminEmail}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to ensure admin user:', error);
    process.exit(1);
  }
}

ensureAdminUser();
