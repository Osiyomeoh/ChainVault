import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/environment';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { authRouter } from './routes/auth';
import { vaultRouter } from './routes/vaults';
import { assetRouter } from './routes/assets';
import { proofOfLifeRouter } from './routes/proofOfLife';
import { professionalRouter } from './routes/professional';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/vaults', vaultRouter);
app.use('/api/assets', assetRouter);
app.use('/api/proof-of-life', proofOfLifeRouter);
app.use('/api/professional', professionalRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await connectDatabase();
    await connectRedis();
    
    const port = config.port || 3001;
    app.listen(port, () => {
      console.log(`🚀 ChainVault API server running on port ${port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Stacks Network: ${config.stacksNetwork}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();