const express = require('express');
const { readJson, writeJson } = require('../services/storage');

const router = express.Router();

// POST /api/drivers/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  const drivers = await readJson('drivers.json');
  const driver = drivers.find(
    d => d.username === username && d.password === password
  );

  if (!driver) return res.status(401).json({ error: 'Invalid credentials' });

  driver.status = 'online';
  await writeJson('drivers.json', drivers);
  res.json({ driver });
});

// GET /api/drivers/:id
router.get('/:id', async (req, res) => {
  const drivers = await readJson('drivers.json');
  const drv = drivers.find(d => d.id === req.params.id);
  if (!drv) return res.status(404).json({ error: 'Driver not found' });
  res.json(drv);
});

// GET /api/drivers
router.get('/', async (req, res) => {
  const drivers = await readJson('drivers.json');
  res.json(drivers);
});

module.exports = router;
