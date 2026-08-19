import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorHandler';

import adminAuthRoutes from './routes/adminAuth';
import studentAuthRoutes from './routes/studentAuth';
import electionRoutes from './routes/elections';
import voterRoutes from './routes/voters';
import candidateRoutes from './routes/candidates';
import voteRoutes from './routes/votes';
import resultRoutes from './routes/results';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', methods: ['GET', 'POST'], credentials: true },
});

app.set('io', io);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/admin', adminAuthRoutes);
app.use('/api/auth', studentAuthRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/voters', voterRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (_req, res) => { res.json({ status: 'ok', timestamp: new Date() }); });

app.use(notFound);
app.use(errorHandler);

// Socket.io
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('join:election', (electionId: string) => { socket.join(`election:${electionId}`); });
  socket.on('leave:election', (electionId: string) => { socket.leave(`election:${electionId}`); });
  socket.on('disconnect', () => { console.log(`Client disconnected: ${socket.id}`); });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voxunite';
mongoose.connect(MONGODB_URI).then(() => {
  console.log('MongoDB connected');
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => { console.log(`VoxUnite server running on port ${PORT}`); });
}).catch((err) => { console.error('MongoDB connection error:', err); process.exit(1); });

export { app, io };
