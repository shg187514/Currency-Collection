import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import nodeRoutes from './features/nodes/nodes.routes';
import attachmentsRoutes from './features/attachments/attachments.routes';
import tagsRoutes from './features/tags/tags.routes';
import statsRoutes from './features/stats/stats.routes';
import { errorHandler } from './common/middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists (Cross-platform)
const uploadsDir = process.env.UPLOAD_DIRECTORY
  ? path.resolve(process.env.UPLOAD_DIRECTORY)
  : path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.disable('x-powered-by');
app.set('trust proxy', 1);

const allowedOrigins = [process.env.CORS_ORIGIN, 'http://localhost:5173'].filter(
  (origin): origin is string => Boolean(origin)
);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Serve uploaded files statically securely
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => {
    // Prevent execution of malicious scripts inside uploads (e.g., SVG, HTML)
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

app.get('/', (req: Request, res: Response) => {
  res.json({ success: true, service: 'TreeSpace Backend', status: 'running' });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'TreeSpace API is running' });
});

// Register feature routes
app.use('/api/nodes', nodeRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', attachmentsRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Global error handler must be the last middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
