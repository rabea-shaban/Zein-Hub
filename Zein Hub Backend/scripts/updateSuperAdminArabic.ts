import { connectDB } from '../src/config/db.config.js';
import { User } from '../src/models/user.model.js';

async function run() {
  await connectDB();
  await User.updateMany({ role: 'super_admin' }, { fullName: 'المشرف العام' });
  console.log('✅ Updated super admin names to المشرف العام in database!');
  process.exit(0);
}

run();
