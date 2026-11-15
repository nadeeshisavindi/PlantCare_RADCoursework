import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

dns.setServers(['8.8.8.8', '1.1.1.1']);

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};
