import bcrypt from 'bcrypt';
import sequelize from '../src/config/database.js';
import User from '../src/models/User.js';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: npx tsx scripts/set-user-password.ts <email> <password>');
  process.exit(1);
}

async function main() {
  await sequelize.authenticate();
  const user = await User.findOne({ where: { email } });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);
  await User.update(
    { password_hash },
    { where: { id: user.id }, individualHooks: false },
  );

  console.log(`Password updated for ${email}`);
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
