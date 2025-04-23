const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const containerRoutes = require('./routes/containers');
const networkRoutes = require('./routes/networks');
const imageRoutes = require('./routes/images');
const composeRoutes = require('./routes/compose');
const dockerfileRoutes = require('./routes/dockerfiles');
const statsRoutes = require('./routes/stats');

// Import middleware
const { authenticateJWT } = require('./middleware/auth');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/vps-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/containers', authenticateJWT, containerRoutes);
app.use('/api/networks', authenticateJWT, networkRoutes);
app.use('/api/images', authenticateJWT, imageRoutes);
app.use('/api/compose', authenticateJWT, composeRoutes);
app.use('/api/dockerfiles', authenticateJWT, dockerfileRoutes);
app.use('/api/stats', authenticateJWT, statsRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
