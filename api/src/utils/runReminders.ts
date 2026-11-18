import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { runReminderCheck } from '../services/reminder.service';

const main = async (): Promise<void> => {
  await connectDB();
  const summary = await runReminderCheck();
  console.log('Reminder check finished:', summary);
  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
