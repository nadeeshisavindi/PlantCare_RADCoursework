import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key: string, fallback: string): string => process.env[key] ?? fallback;

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(optional('PORT', '5000'), 10),
  mongoUri: required('MONGODB_URI'),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  // Comma-separated list, e.g. "http://localhost:3000,https://plantcare.vercel.app"
  clientUrls: optional('CLIENT_URL', 'http://localhost:3000')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean),
  smtp: {
    host: optional('SMTP_HOST', ''),
    port: parseInt(optional('SMTP_PORT', '587'), 10),
    user: optional('SMTP_USER', ''),
    pass: optional('SMTP_PASS', ''),
    from: optional('EMAIL_FROM', 'PlantCare <no-reply@plantcare.app>'),
  },
  reminders: {
    cron: optional('REMINDER_CRON', '* * * * *'),
    timezone: optional('REMINDER_TIMEZONE', 'Asia/Colombo'),
    defaultLeadHours: parseInt(optional('DEFAULT_REMINDER_LEAD_HOURS', '24'), 10),
  },
} as const;
