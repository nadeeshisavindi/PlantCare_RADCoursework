import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const start = async (): Promise<void> => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`PlantCare API running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
