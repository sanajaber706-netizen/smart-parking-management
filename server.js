const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = Number(process.env.PORT) || 3000;
const rootDir = __dirname;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const parkingSlots = [
  { id: 'A1', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A2', floor: 'ground', status: 'occupied', vehicle: 'KA 01 AB 1234', entryTime: '08:15', rate: '$5/hr' },
  { id: 'A3', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A4', floor: 'ground', status: 'occupied', vehicle: 'KA 05 TY 4012', entryTime: '09:10', rate: '$5/hr' },
  { id: 'A5', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A6', floor: 'ground', status: 'occupied', vehicle: 'KA 09 ML 8891', entryTime: '10:40', rate: '$5/hr' },
  { id: 'A7', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A8', floor: 'ground', status: 'occupied', vehicle: 'KA 12 AZ 2308', entryTime: '11:02', rate: '$5/hr' },
  { id: 'A9', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A10', floor: 'ground', status: 'occupied', vehicle: 'KA 16 PQ 4490', entryTime: '12:15', rate: '$5/hr' },
  { id: 'A11', floor: 'ground', status: 'free', vehicle: '', entryTime: '', rate: '$5/hr' },
  { id: 'A12', floor: 'ground', status: 'occupied', vehicle: 'KA 22 RC 1765', entryTime: '12:50', rate: '$5/hr' },
  { id: 'B1', floor: 'upper', status: 'free', vehicle: '', entryTime: '', rate: '$7/hr' },
  { id: 'B2', floor: 'upper', status: 'occupied', vehicle: 'KA 48 LJ 4045', entryTime: '08:30', rate: '$7/hr' },
  { id: 'B3', floor: 'upper', status: 'free', vehicle: '', entryTime: '', rate: '$7/hr' },
  { id: 'B4', floor: 'upper', status: 'occupied', vehicle: 'KA 66 XM 3009', entryTime: '09:45', rate: '$7/hr' },
  { id: 'B5', floor: 'upper', status: 'free', vehicle: '', entryTime: '', rate: '$7/hr' },
  { id: 'B6', floor: 'upper', status: 'occupied', vehicle: 'KA 74 HF 1188', entryTime: '11:28', rate: '$7/hr' },
  { id: 'B7', floor: 'upper', status: 'free', vehicle: '', entryTime: '', rate: '$7/hr' },
  { id: 'B8', floor: 'upper', status: 'occupied', vehicle: 'KA 82 NZ 5527', entryTime: '13:00', rate: '$7/hr' },
];

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function getAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const testServer = http.createServer();

    testServer.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        resolve(getAvailablePort(startPort + 1));
        return;
      }

      reject(error);
    });

    testServer.once('listening', () => {
      testServer.close(() => resolve(startPort));
    });

    testServer.listen(startPort);
  });
}

function createAppServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/api/slots') {
      if (req.method === 'GET') {
        sendJson(res, 200, parkingSlots);
        return;
      }

      if (req.method === 'PATCH') {
        try {
          const updates = await parseRequestBody(req);
          if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
            sendJson(res, 400, { error: 'Request body must be an object' });
            return;
          }

          const allowedFields = new Set(['id', 'status', 'vehicle', 'entryTime']);
          if (Object.keys(updates).some((field) => !allowedFields.has(field))) {
            sendJson(res, 400, { error: 'Request contains unsupported fields' });
            return;
          }

          const { id: slotId } = updates;
          if (typeof slotId !== 'string' || !slotId) {
            sendJson(res, 400, { error: 'A valid slot id is required' });
            return;
          }

          if (updates.status !== undefined && !['free', 'occupied'].includes(updates.status)) {
            sendJson(res, 400, { error: 'Status must be free or occupied' });
            return;
          }
          if (updates.vehicle !== undefined && (typeof updates.vehicle !== 'string' || updates.vehicle.length > 20)) {
            sendJson(res, 400, { error: 'Vehicle must be a string of 20 characters or fewer' });
            return;
          }
          if (updates.entryTime !== undefined && (typeof updates.entryTime !== 'string' || updates.entryTime.length > 20)) {
            sendJson(res, 400, { error: 'Entry time must be a string of 20 characters or fewer' });
            return;
          }

          const targetSlot = parkingSlots.find((slot) => slot.id === slotId);

          if (!targetSlot) {
            sendJson(res, 404, { error: 'Slot not found' });
            return;
          }

          const { status, vehicle, entryTime } = updates;
          if (status !== undefined) targetSlot.status = status;
          if (vehicle !== undefined) targetSlot.vehicle = vehicle;
          if (entryTime !== undefined) targetSlot.entryTime = entryTime;
          sendJson(res, 200, targetSlot);
        } catch (error) {
          sendJson(res, 400, { error: error.message || 'Bad request' });
        }
        return;
      }
    }

    if (url.pathname.startsWith('/api/')) {
      sendJson(res, 404, { error: 'Route not found' });
      return;
    }

    const requestedPath = req.url === '/' ? '/index.html' : req.url;
    const safePath = path.normalize(requestedPath).replace(/^\/+/, '');
    const filePath = path.join(rootDir, safePath);

    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

async function startServer(port = DEFAULT_PORT) {
  const selectedPort = await getAvailablePort(port);
  const server = createAppServer();

  server.listen(selectedPort, () => {
    console.log(`Parking dashboard running at http://localhost:${selectedPort}`);
  });

  return server;
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = { getAvailablePort, startServer, parkingSlots };
