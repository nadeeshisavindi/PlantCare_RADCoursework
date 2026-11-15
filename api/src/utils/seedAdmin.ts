import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/user.model';
import { UserRole } from '../types/enums';

// Usage: npm run seed:admin   (reads ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD from .env)
const run = async (): Promise<void> => {
  const name = process.env.ADMIN_NAME ?? 'PlantCare Admin';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first');
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({ name, email, password, role: UserRole.ADMIN });
    console.log(`Admin created: ${email}`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
