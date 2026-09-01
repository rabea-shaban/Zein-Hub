import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.config.js';
import { User } from '../src/models/user.model.js';
import { UserRole } from '../src/constants/roles.enum.js';

async function fixAllUserPasswords() {
  console.log('🔄 Connecting to MongoDB to fix user passwords...');
  await connectDB();

  // 1. Fix / Reset Super Admin
  const adminEmail = 'admin@zeinhub.com';
  let admin = await User.findOne({ email: adminEmail }).select('+password');
  const adminPass = 'Admin@ZeinHub2026!';
  const salt = await bcrypt.genSalt(10);
  const hashedAdminPass = await bcrypt.hash(adminPass, salt);

  if (admin) {
    admin.password = hashedAdminPass;
    admin.isActive = true;
    admin.role = UserRole.SUPER_ADMIN;
    await admin.save();
    console.log(`✅ Super Admin password reset: ${adminEmail} / ${adminPass}`);
  } else {
    admin = new User({
      fullName: 'Super Admin',
      email: adminEmail,
      password: hashedAdminPass,
      phone: '01000000000',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    });
    await admin.save();
    console.log(`✅ Super Admin created: ${adminEmail} / ${adminPass}`);
  }

  // 2. Fix all Instructors (e.g. dr.tarek, sara, hossam, reham, rabea, etc.)
  const instructorPass = 'InstructorPass2026!';
  const hashedInstructorPass = await bcrypt.hash(instructorPass, salt);

  const instructors = await User.find({ role: UserRole.INSTRUCTOR }).select('+password');
  console.log(`Found ${instructors.length} instructors.`);

  for (const inst of instructors) {
    inst.password = hashedInstructorPass;
    inst.isActive = true;
    await inst.save();
    console.log(`✅ Instructor password fixed: ${inst.email} (${inst.fullName}) / ${instructorPass}`);
  }

  console.log('🎉 All user passwords verified and fixed successfully!');
  await mongoose.connection.close();
  process.exit(0);
}

fixAllUserPasswords().catch((err) => {
  console.error('❌ Error fixing passwords:', err);
  process.exit(1);
});
