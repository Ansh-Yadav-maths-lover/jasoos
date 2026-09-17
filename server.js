/**
 * JASOOS Local Live Server
 * Serves static assets, app shell, and provides real-time WebSocket room relay.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const ROOT_DIR = __dirname;
const OUTPUTS_DIR = path.join(ROOT_DIR, 'outputs');
const ASSETS_DIR = path.join(ROOT_DIR, 'jasoos', 'assets');
const JASOOS_DIR = path.join(ROOT_DIR, 'jasoos');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
};

function resolveFilePath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  if (cleanPath === '/' || cleanPath === '/index.html') {
    const p1 = path.join(OUTPUTS_DIR, 'index.html');
    if (fs.existsSync(p1)) return p1;
    const p2 = path.join(OUTPUTS_DIR, 'jasoos.html');
    if (fs.existsSync(p2)) return p2;
  }

  // 1. Check in outputs/
  const fromOutputs = path.join(OUTPUTS_DIR, cleanPath);
  if (fs.existsSync(fromOutputs) && fs.statSync(fromOutputs).isFile()) {
    return fromOutputs;
  }

  // 2. Check in jasoos/assets/
  const fromAssets = path.join(ASSETS_DIR, cleanPath);
  if (fs.existsSync(fromAssets) && fs.statSync(fromAssets).isFile()) {
    return fromAssets;
  }

  // 3. Check in jasoos/
  const fromJasoos = path.join(JASOOS_DIR, cleanPath);
  if (fs.existsSync(fromJasoos) && fs.statSync(fromJasoos).isFile()) {
    return fromJasoos;
  }

  // 4. Check root
  const fromRoot = path.join(ROOT_DIR, cleanPath);
  if (fs.existsSync(fromRoot) && fs.statSync(fromRoot).isFile()) {
    return fromRoot;
  }

  return null;
}

const server = http.createServer((req, res) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  const method = req.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    return res.end('Method Not Allowed');
  }

  const filePath = resolveFilePath(req.url);
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const stat = fs.statSync(filePath);

  const headers = {
    'Content-Type': contentType,
    'Content-Length': stat.size,
  };

  // Service Worker and manifest headers
  if (path.basename(filePath) === 'sw.js') {
    headers['Service-Worker-Allowed'] = '/';
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  } else if (ext === '.html') {
    headers['Cache-Control'] = 'no-cache';
  } else {
    headers['Cache-Control'] = 'public, max-age=86400';
  }

  res.writeHead(200, headers);
  if (method === 'HEAD') return res.end();

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

// ============ WebSocket Relay ============
const wss = new WebSocketServer({ noServer: true });

// Rooms map: roomCode -> { clients: Map(peerId -> ws), state: {} }
const rooms = new Map();

function getRoom(code) {
  code = code.toUpperCase();
  let r = rooms.get(code);
  if (!r) {
    r = { code, clients: new Map(), state: {}, timer: null };
    rooms.set(code, r);
  }
  if (r.timer) {
    clearTimeout(r.timer);
    r.timer = null;
  }
  return r;
}

function generatePeerId() {
  return Math.random().toString(36).slice(2, 10);
}

server.on('upgrade', (req, socket, head) => {
  console.log(`[WS UPGRADE] ${req.url}`, req.headers['upgrade'], req.headers['connection']);
  const url = req.url || '';
  const match = url.match(/^\/ws\/jasoos-([A-Za-z0-9]+)/i);

  if (match) {
    const roomCode = match[1].toUpperCase();
    wss.handleUpgrade(req, socket, head, (ws) => {
      console.log(`[WS CONNECTED] Room: ${roomCode}`);
      wss.emit('connection', ws, req, roomCode);
    });
  } else {
    console.log(`[WS REJECTED] URL: ${url}`);
    socket.destroy();
  }
});

wss.on('connection', (ws, req, roomCode) => {
  const room = getRoom(roomCode);
  const peerId = generatePeerId();

  ws.peerId = peerId;
  ws.roomCode = roomCode;
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  const existingPeers = Array.from(room.clients.keys());
  room.clients.set(peerId, ws);

  // Send welcome packet
  ws.send(JSON.stringify({
    type: 'welcome',
    id: peerId,
    peers: existingPeers,
    state: room.state,
  }));

  // Broadcast join to others in the room
  const joinMsg = JSON.stringify({ type: 'join', id: peerId });
  room.clients.forEach((client, id) => {
    if (id !== peerId && client.readyState === WebSocket.OPEN) {
      client.send(joinMsg);
    }
  });

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      return;
    }

    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'msg') {
      const payload = JSON.stringify({
        type: 'msg',
        from: peerId,
        data: msg.data,
      });

      if (msg.to) {
        // Direct peer message
        const target = room.clients.get(msg.to);
        if (target && target.readyState === WebSocket.OPEN) {
          target.send(payload);
        }
      } else {
        // Broadcast to all other peers in the room
        room.clients.forEach((client, id) => {
          if (id !== peerId && client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        });
      }
    } else if (msg.type === 'set') {
      // Room state sync
      if (msg.key != null) {
        room.state[msg.key] = msg.value;
      }
    }
  });

  ws.on('close', () => {
    room.clients.delete(peerId);
    const leaveMsg = JSON.stringify({ type: 'leave', id: peerId });
    room.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(leaveMsg);
      }
    });

    if (room.clients.size === 0) {
      // Clean up idle room after 15 minutes
      room.timer = setTimeout(() => {
        if (room.clients.size === 0) {
          rooms.delete(roomCode);
        }
      }, 15 * 60 * 1000);
    }
  });

  ws.on('error', () => {
    try { ws.close(); } catch (e) {}
  });
});

// Periodic heartbeat to prevent dropped connections
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 25000);

wss.on('close', () => clearInterval(interval));

server.listen(PORT, () => {
  const localUrl = `http://localhost:${PORT}`;
  console.log(`\n==================================================`);
  console.log(`  🕵️  JASOOS — Indian Imposter Party Game LIVE`);
  console.log(`  🔗 Local URL: ${localUrl}`);
  console.log(`  ⚡ WebSocket: ws://localhost:${PORT}/ws/jasoos-:code`);
  console.log(`==================================================\n`);
});
