const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

async function readJson(filename) {
  try {
    const full = path.join(DATA_DIR, filename);
    const txt = await fs.readFile(full, 'utf8');
    return JSON.parse(txt || '[]');
  } catch {
    return [];
  }
}

async function writeJson(filename, data) {
  const full = path.join(DATA_DIR, filename);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, JSON.stringify(data, null, 2));
}

module.exports = { readJson, writeJson };
