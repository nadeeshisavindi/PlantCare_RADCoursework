import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { startReminderScheduler } from './services/scheduler';

const start = async (): Promise<void> => {
  await connectDB();
  startReminderScheduler();

  app.listen(env.port, () => {
    console.log(`PlantCare API running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
