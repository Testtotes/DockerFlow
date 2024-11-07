import mongoose from 'mongoose';

const containerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  imageUrl: String,
  dockerfile: String,
  port: { type: Number, required: true },
  status: { type: String, enum: ['running', 'stopped', 'error'], default: 'stopped' },
  containerId: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  lastStarted: Date,
  exposedPort: Number
});

export default mongoose.model('Container', containerSchema);