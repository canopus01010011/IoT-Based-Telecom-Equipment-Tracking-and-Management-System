import bcrypt from 'bcrypt';
import sequelize from '../config/database.js';
import User from '../models/User.js';

function requireArg(value: string | undefined, label: string): string {
  if (!value) {
    console.error(
      `Missing ${label}. Usage: npx tsx src/scripts/set-user-password.ts <email> <password>`,
    );
    process.exit(1);
  }
  return value;
}

const emailArg = requireArg(process.argv[2], 'email');
const passwordArg = requireArg(process.argv[3], 'password');

async function main() {
  await sequelize.authenticate();

  const user = await User.findOne({ where: { email: emailArg } });
  if (!user) {
    console.error(`User not found: ${emailArg}`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(passwordArg, 10);
  await user.update({ password_hash: hashedPassword }, { hooks: false });

  console.log(`Password updated for ${emailArg}`);
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
