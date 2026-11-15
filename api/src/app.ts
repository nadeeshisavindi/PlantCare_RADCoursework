import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/errorHandler';
import AuthRouter from './routes/auth.routers';
import PlantRouter from './routes/plant.routers';

const app = express();


app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
     
      if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true, 
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());


app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'PlantCare API is running', uptime: process.uptime() });
});

app.use('/api/auth', AuthRouter);
app.use('/api/plants', PlantRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
