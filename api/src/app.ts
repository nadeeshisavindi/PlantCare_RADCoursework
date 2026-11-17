import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/errorHandler';
import AdminRouter from './routes/admin.routers';
import AuthRouter from './routes/auth.routers';
import CareTaskRouter from './routes/careTask.routers';
import NotificationRouter from './routes/notification.routers';
import PlantRouter from './routes/plant.routers';

const app = express();

// Render sits behind a proxy; needed for correct client IPs (rate limiting) and secure cookies
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow tools without an Origin header (curl, Postman, health checks) and whitelisted web apps
      if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true, // required so the browser sends/accepts the refresh-token cookie
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Health check (used by Render)
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'PlantCare API is running', uptime: process.uptime() });
});

app.use('/api/auth', AuthRouter);
app.use('/api/admin', AdminRouter);
app.use('/api/plants', PlantRouter);
app.use('/api/care-tasks', CareTaskRouter);
app.use('/api/notifications', NotificationRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
