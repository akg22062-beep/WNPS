import express from 'express';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const app = express();
const port = Number(process.env.PORT || 3001);
const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const databaseFile = process.env.SCHOOL_DB_FILE || path.join(rootDirectory, 'data', 'school-database.json');
const frontendDirectory = path.join(rootDirectory, 'dist');
const apiToken = process.env.API_ACCESS_TOKEN;
const allowedResources = new Set(['students', 'receipts', 'expenses']);

app.use(express.json({ limit: '12mb' }));
app.use((req, res, next) => {
  if (!apiToken || req.path === '/api/health') return next();
  if (req.get('X-API-Key') !== apiToken) return res.status(401).json({ error: 'API authentication required' });
  next();
});
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const emptyDatabase = () => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  students: [],
  receipts: [],
  expenses: [],
});

async function readDatabase() {
  try {
    const contents = await readFile(databaseFile, 'utf8');
    return { ...emptyDatabase(), ...JSON.parse(contents) };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const database = emptyDatabase();
    await writeDatabase(database);
    return database;
  }
}

async function writeDatabase(database) {
  await mkdir(path.dirname(databaseFile), { recursive: true });
  const temporaryFile = `${databaseFile}.tmp`;
  await writeFile(
    temporaryFile,
    JSON.stringify({ ...database, updatedAt: new Date().toISOString() }, null, 2),
    'utf8',
  );
  await rename(temporaryFile, databaseFile);
}

function resourceOrBadRequest(resource, res) {
  if (allowedResources.has(resource)) return true;
  res.status(404).json({ error: `Unknown resource: ${resource}` });
  return false;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: databaseFile });
});

app.get('/api/database', async (_req, res, next) => {
  try {
    res.json(await readDatabase());
  } catch (error) {
    next(error);
  }
});

app.get('/api/:resource', async (req, res, next) => {
  if (!resourceOrBadRequest(req.params.resource, res)) return;
  try {
    const database = await readDatabase();
    res.json(database[req.params.resource]);
  } catch (error) {
    next(error);
  }
});

app.put('/api/:resource', async (req, res, next) => {
  if (!resourceOrBadRequest(req.params.resource, res)) return;
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Expected an array of records' });
  try {
    const database = await readDatabase();
    database[req.params.resource] = req.body;
    await writeDatabase(database);
    res.json(database[req.params.resource]);
  } catch (error) {
    next(error);
  }
});

app.post('/api/:resource', async (req, res, next) => {
  if (!resourceOrBadRequest(req.params.resource, res)) return;
  try {
    const database = await readDatabase();
    const item = { ...req.body, id: req.body.id || randomUUID() };
    database[req.params.resource].unshift(item);
    await writeDatabase(database);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

app.put('/api/:resource/:id', async (req, res, next) => {
  if (!resourceOrBadRequest(req.params.resource, res)) return;
  try {
    const database = await readDatabase();
    const items = database[req.params.resource];
    const index = items.findIndex(item => item.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Record not found' });
    items[index] = { ...items[index], ...req.body, id: req.params.id };
    await writeDatabase(database);
    res.json(items[index]);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/:resource/:id', async (req, res, next) => {
  if (!resourceOrBadRequest(req.params.resource, res)) return;
  try {
    const database = await readDatabase();
    const items = database[req.params.resource];
    const remaining = items.filter(item => item.id !== req.params.id);
    if (remaining.length === items.length) return res.status(404).json({ error: 'Record not found' });
    database[req.params.resource] = remaining;
    await writeDatabase(database);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

app.use(express.static(frontendDirectory));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDirectory, 'index.html'), error => {
    if (error) next(error);
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Database operation failed' });
});

app.listen(port, () => {
  console.log(`Wisdom School database API running at http://localhost:${port}`);
  console.log(`Database file: ${databaseFile}`);
});
