import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkoutRouter } from './routes/checkout';
import { webhooksRouter } from './routes/webhooks';
import { premiumRouter } from './routes/premium';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Required for Railway/Docker

// CORS configuration - allow all origins for now
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
}));

// Raw body parser for webhook signature verification (must be before json parser)
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// JSON parser for other routes
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Wakey API Server', status: 'running' });
});

// Mount routes
app.use('/api', checkoutRouter);
app.use('/api', webhooksRouter);
app.use('/api', premiumRouter);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server - bind to 0.0.0.0 for external access
app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 API server running on http://${HOST}:${PORT}`);
  console.log(`   Health check: http://${HOST}:${PORT}/api/health`);
});

export default app;
