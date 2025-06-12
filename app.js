// app.js
const express = require('express');
const cors = require('cors');
const { testConnection, createTables } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://inventory123321.netlify.app', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'API is running with PostgreSQL'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  const { getPool } = require('./config/database');
  const pool = getPool();
  if (pool) {
    await pool.end();
    console.log('✅ Database connections closed');
  }
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST   /api/register        - Register new user`);
  console.log(`   POST   /api/login           - User login`);
  console.log(`   GET    /api/profile         - Get user profile`);
  console.log(`   GET    /api/inventory       - Get all inventory items`);
  console.log(`   GET    /api/inventory/:id   - Get inventory item by ID`);
  console.log(`   POST   /api/inventory       - Create inventory item`);
  console.log(`   PUT    /api/inventory/:id   - Update inventory item`);
  console.log(`   DELETE /api/inventory/:id   - Delete inventory item`);
  console.log(`   GET    /api/health          - Health check`);
  
  // Test database connection and create tables
  console.log('\n🔍 Testing database connection...');
  const connected = await testConnection();
  if (connected) {
    await createTables();
  }
});

module.exports = app;