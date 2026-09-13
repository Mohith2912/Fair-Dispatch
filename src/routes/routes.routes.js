const express = require('express');
const { readJson, writeJson } = require('../services/storage');

const router = express.Router();

// GET /api/routes/:driverId/stops
router.get('/:driverId/stops', async (req, res) => {
  const driverId = req.params.driverId;
  const stops = await readJson('stops.json');
  const filtered = stops.filter(s => String(s.driverId || 'driver1') === String(driverId));
  res.json(filtered);
});

// POST /api/routes/:driverId/stops/:stopId/start
router.post('/:driverId/stops/:stopId/start', async (req, res) => {
  const stopId = Number(req.params.stopId);
  const stops = await readJson('stops.json');
  const idx = stops.findIndex(s => s.id === stopId);
  if (idx === -1) return res.status(404).json({ error: 'Stop not found' });

  stops[idx].status = 'in-progress';
  stops[idx].elapsedSeconds = 0;
  await writeJson('stops.json', stops);
  res.json(stops[idx]);
});

// POST /api/routes/:driverId/stops/:stopId/complete
router.post('/:driverId/stops/:stopId/complete', async (req, res) => {
  const stopId = Number(req.params.stopId);
  const { elapsedSeconds = 0 } = req.body || {};
  const stops = await readJson('stops.json');
  const idx = stops.findIndex(s => s.id === stopId);
  if (idx === -1) return res.status(404).json({ error: 'Stop not found' });

  stops[idx].status = 'completed';
  stops[idx].timeTakenSeconds = elapsedSeconds;
  stops[idx].elapsedSeconds = elapsedSeconds;
  await writeJson('stops.json', stops);
  res.json(stops[idx]);
});

// POST /api/routes/:driverId/stops/:stopId/feedback
router.post('/:driverId/stops/:stopId/feedback', async (req, res) => {
  const stopId = Number(req.params.stopId);
  const { efforts = [] } = req.body || {};
  const stops = await readJson('stops.json');
  const idx = stops.findIndex(s => s.id === stopId);
  if (idx === -1) return res.status(404).json({ error: 'Stop not found' });

  stops[idx].feedback = efforts;
  await writeJson('stops.json', stops);
  res.json(stops[idx]);
});

module.exports = router;
