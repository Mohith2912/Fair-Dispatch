// src/index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const driversRouter = require('./routes/drivers.routes');
const routesRouter = require('./routes/routes.routes');
const loadsRouter = require('./routes/loads.routes');
const supportRouter = require('./routes/support.routes');
const healthRouter = require('./routes/health.routes');
const etaRouter = require('./routes/eta.routes'); // NEW

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/drivers', driversRouter);
app.use('/api/routes', routesRouter);
app.use('/api/loads', loadsRouter);
app.use('/api/support', supportRouter);
app.use('/api/health', healthRouter);
app.use('/api/eta', etaRouter); // NEW

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FairDispatch backend running on http://localhost:${PORT}`);
});
