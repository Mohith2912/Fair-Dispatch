const express = require('express');
const { v4: uuid } = require('uuid');
const { readJson, writeJson } = require('../services/storage');
const { chooseFairestDriver } = require('../services/fairness');

const router = express.Router();

// GET /api/loads
router.get('/', async (req, res) => {
  const loads = await readJson('loads.json');
  res.json(loads);
});

// POST /api/loads  (manager adds work)
router.post('/', async (req, res) => {
  const { pickupAddress, dropAddress, weight, distanceKm, difficulty } = req.body || {};
  if (!pickupAddress || !dropAddress) {
    return res.status(400).json({ error: 'pickupAddress and dropAddress required' });
  }

  const loads = await readJson('loads.json');
  const newLoad = {
    id: uuid(),
    pickupAddress,
    dropAddress,
    weight: Number(weight) || 0,
    distanceKm: Number(distanceKm) || 0,
    difficulty: difficulty || 'Medium',
    status: 'unassigned',
    assignedTo: null,
    createdAt: Date.now()
  };
  loads.push(newLoad);
  await writeJson('loads.json', newLoad ? loads : loads);
  res.status(201).json(newLoad);
});

// POST /api/loads/:id/assign-auto
router.post('/:id/assign-auto', async (req, res) => {
  const loadId = req.params.id;
  const loads = await readJson('loads.json');
  const drivers = await readJson('drivers.json');

  const idx = loads.findIndex(l => l.id === loadId);
  if (idx === -1) return res.status(404).json({ error: 'Load not found' });

  const load = loads[idx];
  const driver = chooseFairestDriver(drivers);
  if (!driver) return res.status(400).json({ error: 'No drivers available' });

  load.status = 'assigned';
  load.assignedTo = driver.id;
  driver.workloadWeight = (driver.workloadWeight || 0) + (load.weight || 0);

  await writeJson('loads.json', loads);
  await writeJson('drivers.json', drivers);

  res.json({ load, assignedDriver: driver });
});

module.exports = router;
