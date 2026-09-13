// src/routes/eta.routes.js
const express = require('express');
const { readJson } = require('../services/storage');

const router = express.Router();

// Haversine distance between two lat/lng points in km
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * POST /api/eta/:driverId
 * Body: { currentLat, currentLng, stopId }
 * Returns: { stopId, distanceKm, etaSeconds, etaText }
 */
router.post('/:driverId', async (req, res) => {
  try {
    const { currentLat, currentLng, stopId } = req.body || {};

    if (
      typeof currentLat !== 'number' ||
      typeof currentLng !== 'number' ||
      !stopId
    ) {
      return res
        .status(400)
        .json({ error: 'currentLat, currentLng and stopId are required' });
    }

    const stops = await readJson('stops.json');
    const stop = stops.find(s => String(s.id) === String(stopId));
    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }
    if (typeof stop.latitude !== 'number' || typeof stop.longitude !== 'number') {
      return res
        .status(500)
        .json({ error: 'Stop does not have valid latitude/longitude' });
    }

    // 1. Distance in km (straight line)
    const distanceKm = haversineKm(
      currentLat,
      currentLng,
      stop.latitude,
      stop.longitude
    );

    // 2. Assume average speed (km/h). You can tune this.
    const speedKmPerHour = 20; // e.g. bike in city
    const etaHours = distanceKm / speedKmPerHour;
    let etaSeconds = Math.round(etaHours * 3600);

    if (!isFinite(etaSeconds) || etaSeconds < 0) etaSeconds = 0;

    // 3. Make a friendly text like "5 mins", "20 mins"
    const etaMinutes = Math.max(1, Math.round(etaSeconds / 60));
    const etaText = etaMinutes === 1 ? '1 min' : `${etaMinutes} mins`;

    res.json({
      stopId,
      distanceKm: Number(distanceKm.toFixed(2)),
      etaSeconds,
      etaText
    });
  } catch (err) {
    console.error('ETA error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
