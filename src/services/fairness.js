function computeEffortScore(stop) {
  const base = 50;
  const diff = (stop.difficulty || 0) * 3;
  const w = (stop.listedWeight || 0) * 1.5;
  return Math.min(120, base + diff + w);
}

function chooseFairestDriver(drivers) {
  if (!drivers || !drivers.length) return null;
  return drivers.reduce((best, d) => {
    if (!best) return d;
    const bestScore = (best.fairnessIndex || 1) * (1 + (best.workloadWeight || 0) / 100);
    const score = (d.fairnessIndex || 1) * (1 + (d.workloadWeight || 0) / 100);
    return score < bestScore ? d : best;
  }, null);
}

module.exports = { computeEffortScore, chooseFairestDriver };
