const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const admin = require('firebase-admin');

// 🔥 YOUR FIREBASE SETUP
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fairdispatch-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

const app = express();
const PORT = 3001;

// Full CORS (Web + Mobile)
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:19006', '*'],
  credentials: true 
}));
app.use(express.json());

// Firebase paths
const DRIVERSPATH = 'drivers';
const TASKSPATH = 'tasks';

// 🔥 FIREBASE read/write
const readJson = async (path) => {
  try {
    const snapshot = await db.ref(path).once('value');
    return snapshot.val() || [];
  } catch (error) {
    console.error(`Firebase read ${path}:`, error);
    return [];
  }
};

const writeJson = async (path, data) => {
  try {
    await db.ref(path).set(data);
    console.log(`✅ Firebase SAVED: ${path}`);
  } catch (error) {
    console.error(`Firebase write ${path}:`, error);
  }
};

// 🔥 Initialize Firebase data
const initData = async () => {
  console.log('🔄 Initializing Firebase...');
  
  const drivers = [
    { id: 'D1', name: 'Raju Kumar', fairness_index: 1.20, workload: 140, experience: '3 yrs', disputes: 3 },
    { id: 'D2', name: 'Priya Sharma', fairness_index: 0.95, workload: 90, experience: '1 yr', disputes: 0 },
    { id: 'D3', name: 'Ajay Patel', fairness_index: 1.05, workload: 110, experience: '5 yrs', disputes: 1 }
  ];
  
  const tasks = [
    { id: 'T1', address: 'Flat 305, Sunshine Apartments', expected_weight: 12, difficulty: 7, stairs_factor: true, status: 'pending' },
    { id: 'T2', address: 'Villa GF, Lakeside Colony', expected_weight: 5, difficulty: 2, stairs_factor: false, status: 'completed' },
    { id: 'T3', address: '4th Floor, No Elevator', expected_weight: 15, difficulty: 9, stairs_factor: true, status: 'pending' },
    { id: 'T4', address: 'Shop GF, Market Road', expected_weight: 8, difficulty: 3, stairs_factor: false, status: 'pending' }
  ];

  await writeJson(DRIVERSPATH, drivers);
  await writeJson(TASKSPATH, tasks);
  console.log('✅ Firebase initialized!');
};

// 🔥 API ENDPOINTS

// Health check
app.get('/health', async (req, res) => {
  const drivers = await readJson(DRIVERSPATH);
  const tasks = await readJson(TASKSPATH);
  res.json({ 
    success: true, 
    status: '🚀 BACKEND + FIREBASE LIVE!',
    firebase: 'https://fairdispatch-default-rtdb.asia-southeast1.firebasedatabase.app',
    drivers: drivers.length,
    tasks: tasks.length 
  });
});

// POST /login - Frontend exact match
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const demoUsers = {
    'driver1': { password: '1234', name: 'Raju Kumar', driverId: 'D1' },
    'driver2': { password: '1234', name: 'Priya Sharma', driverId: 'D2' },
    'driver3': { password: '1234', name: 'Ajay Patel', driverId: 'D3' }
  };
  
  const user = demoUsers[username];
  if (user && user.password === password) {
    res.json({ 
      success: true, 
      token: 'fairdispatch-token',
      driverId: user.driverId,
      driverName: user.name 
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// GET /drivers - Frontend dashboard
app.get('/drivers', async (req, res) => {
  const drivers = await readJson(DRIVERSPATH);
  res.json({ success: true, data: drivers });
});

// GET /tasks - Frontend route + difficulty_score
app.get('/tasks', async (req, res) => {
  let tasks = await readJson(TASKSPATH);
  tasks = tasks.map(t => ({
    ...t,
    weight: t.expected_weight,
    stairs: t.stairs_factor,
    difficulty_score: (t.expected_weight * 0.5) + t.difficulty
  }));
  res.json({ success: true, data: tasks });
});

// POST /tasks/:id/complete - Task completion
app.post('/tasks/:id/complete', async (req, res) => {
  const { driverId } = req.body;
  let tasks = await readJson(TASKSPATH);
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex !== -1) {
    tasks[taskIndex].status = 'completed';
    tasks[taskIndex].completed_by = driverId;
    await writeJson(TASKSPATH, tasks);
    
    // Update driver workload
    let drivers = await readJson(DRIVERSPATH);
    const driverIndex = drivers.findIndex(d => d.id === driverId);
    if (driverIndex !== -1) {
      drivers[driverIndex].workload += tasks[taskIndex].expected_weight;
      await writeJson(DRIVERSPATH, drivers);
    }
    
    res.json({ success: true, message: 'Task completed - Firebase updated!' });
  } else {
    res.status(404).json({ success: false });
  }
});

// POST /drivers/:id/dispute
app.post('/drivers/:id/dispute', async (req, res) => {
  let drivers = await readJson(DRIVERSPATH);
  const driverIndex = drivers.findIndex(d => d.id === req.params.id);
  if (driverIndex !== -1) {
    drivers[driverIndex].disputes += 1;
    drivers[driverIndex].fairness_index = Math.max(0.5, parseFloat(drivers[driverIndex].fairness_index) - 0.03).toFixed(2);
    await writeJson(DRIVERSPATH, drivers);
    res.json({ success: true, message: 'Dispute logged - Firebase updated!' });
  } else {
    res.status(404).json({ success: false });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// 🚀 START
const startServer = async () => {
  await initData();
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(70));
    console.log(`🚀 FAIRDISPATCH BACKEND + FIREBASE LIVE!`);
    console.log(`📡 http://localhost:${PORT}`);
    console.log(`☁️  https://fairdispatch-default-rtdb.asia-southeast1.firebasedatabase.app`);
    console.log('='.repeat(70));
    console.log('✅ POST /login {"username":"driver1","password":"1234"}');
    console.log('✅ GET  /drivers');
    console.log('✅ GET  /tasks');
    console.log('✅ POST /tasks/T1/complete {"driverId":"D1"}');
    console.log('='.repeat(70));
  });
};

startServer().catch(console.error);
