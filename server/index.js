import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Docker from 'dockerode';
import winston from 'winston';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { containerController } from './controllers/containerController.js';

dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

const app = express();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

app.use(cors());
app.use(express.json());

// Authentication middleware
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Admin middleware
const adminOnly = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Container routes
app.post('/api/containers/deploy', auth, containerController.deploy);
app.get('/api/containers', auth, containerController.list);
app.post('/api/containers/:id/:action', auth, containerController.control);

// Original Docker API routes
app.get('/api/docker/containers', auth, async (req, res, next) => {
  try {
    const containers = await docker.listContainers({ all: true });
    res.json(containers);
  } catch (err) {
    next(err);
  }
});

app.get('/api/docker/images', auth, async (req, res, next) => {
  try {
    const images = await docker.listImages();
    res.json(images);
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
};

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
});