import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { ENV } from '../src/config/env.config.js';
import { User } from '../src/models/user.model.js';
import { UserRole } from '../src/constants/roles.enum.js';

async function seedSuperAdmin() {
  console.log('=========================================');
  console.log('👑 Seeding Super Admin Account...');
  console.log('=========================================');

  await connectDB();

  const email = ENV.SUPER_ADMIN_EMAIL.toLowerCase().trim();
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    if (existingAdmin.role !== UserRole.SUPER_ADMIN) {
      existingAdmin.role = UserRole.SUPER_ADMIN;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log(`[Seed] User ${email} updated to role: super_admin`);
    } else {
      console.log(`[Seed] Super Admin already exists: ${email}`);
    }
  } else {
    const superAdmin = new User({
      fullName: ENV.SUPER_ADMIN_NAME,
      email,
      password: ENV.SUPER_ADMIN_PASSWORD,
      phone: ENV.SUPER_ADMIN_PHONE,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    });

    await superAdmin.save();
    console.log(`[Seed] Super Admin created successfully!`);
    console.log(`👤 Name: ${ENV.SUPER_ADMIN_NAME}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Role: ${UserRole.SUPER_ADMIN}`);
  }

  console.log('=========================================');
  await mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
}

seedSuperAdmin().catch((err) => {
  console.error('[Seed Error] Failed to seed Super Admin:', err);
  process.exit(1);
});
