require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const watchChanges = require('./config/changeStream');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const settlementRoutes = require('./routes/settlementRoutes');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to database
connectDB().then(() => {
  // Start watching database changes after connection
  mongoose.connection.once('open', () => {
    watchChanges(mongoose, io);
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  // console.log('🔌 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });

  // Optional: Allow clients to subscribe to specific collections
  socket.on('subscribe', (collectionName) => {
    socket.join(collectionName);
    // console.log(`📡 Client ${socket.id} subscribed to ${collectionName}`);
  });

  socket.on('unsubscribe', (collectionName) => {
    socket.leave(collectionName);
    console.log(`📡 Client ${socket.id} unsubscribed from ${collectionName}`);
  });
});

// Make io accessible in routes/controllers
app.set('io', io);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // limit each IP to 5000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DigiPay API is running',
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount,
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to DigiPay API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 DigiPay API server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🧪 Test Mode: ${process.env.PAYMENT_TEST_MODE === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🔌 Socket.IO enabled for real-time updates`);
});

module.exports = { app, server, io };
