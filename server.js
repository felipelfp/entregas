const http = require('http');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');
const DIST_DIR = path.join(__dirname, 'dist');

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
        objectives: [],
        debts: [],
        transactions: [],
        tasks: [],
        deliveries: [],
        settings: { exchangeRate: 5.0 }
    }, null, 2));
}

const readDB = () => {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!data.deliveries) data.deliveries = [];
    if (!data.settings) data.settings = { exchangeRate: 5.0 };
    return data;
};
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const MIME_TYPES = {
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.mjs':  'application/javascript',
    '.css':  'text/css',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
    '.webmanifest': 'application/manifest+json',
};

function serveStatic(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch {

        try {
            const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexHtml);
        } catch {
            res.writeHead(404);
            res.end('Not Found');
        }
    }
}

const server = http.createServer((req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname.startsWith('/api')) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const pathParts = pathname.split('/').filter(p => p !== '');
            const resource = pathParts[1]; 
            const id = pathParts[2];
            const db = readDB();

            res.setHeader('Content-Type', 'application/json');

            if (resource === 'delivery-history') {
                if (req.method === 'GET') {
                    res.writeHead(200);
                    res.end(JSON.stringify(db.deliveries || []));
                    return;
                } else if (req.method === 'DELETE' && id) {
                    const index = db.deliveries.findIndex(item => item.id == id);
                    if (index !== -1) {
                        db.deliveries.splice(index, 1);
                        writeDB(db);
                        res.writeHead(200);
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.writeHead(404);
                        res.end(JSON.stringify({ error: 'Not found' }));
                    }
                    return;
                }
            }

            if (resource === 'delivery-save' && req.method === 'POST') {
                const newItem = JSON.parse(body);
                if (!db.deliveries) db.deliveries = [];
                if (newItem.id) {
                    const index = db.deliveries.findIndex(item => item.id == newItem.id);
                    if (index !== -1) {
                        db.deliveries[index] = { ...db.deliveries[index], ...newItem };
                    } else {
                        db.deliveries.push(newItem);
                    }
                } else {
                    newItem.id = Date.now().toString() + Math.random().toString().slice(2, 6);
                    db.deliveries.push(newItem);
                }
                writeDB(db);
                res.writeHead(200);
                res.end(JSON.stringify(newItem));
                return;
            }

            if (resource === 'delivery-stats' && req.method === 'GET') {
                const deliveries = db.deliveries || [];
                let totalGanhos = 0, totalGasolina = 0, totalManutencao = 0, totalKm = 0, totalAntecipacao = 0;
                deliveries.forEach(d => {
                    totalGanhos     += Number(d.ganhos || 0);
                    totalGasolina   += Number(d.gasolina || 0);
                    totalManutencao += Number(d.manutencao || 0);
                    totalAntecipacao+= Number(d.antecipacao || 0);
                    const km = Number(d.km_final || 0) - Number(d.km_inicial || 0);
                    if (km > 0) totalKm += km;
                });
                const profit = totalGanhos - (totalGasolina + totalManutencao + totalAntecipacao);
                const totalProfitAllTime = totalGanhos - totalGasolina;
                res.writeHead(200);
                res.end(JSON.stringify({ profit, totalProfitAllTime, km: totalKm, gasolina: totalGasolina, manutencao: totalManutencao, ganhosBrutos: totalGanhos }));
                return;
            }

            if (resource === 'save-month' && req.method === 'POST') {
                if (!db.reports) db.reports = [];
                const report = JSON.parse(body);
                report.id = Date.now().toString();
                db.reports.push(report);
                writeDB(db);
                res.writeHead(201);
                res.end(JSON.stringify(report));
                return;
            }
            if (resource === 'reports' && req.method === 'GET') {
                res.writeHead(200);
                res.end(JSON.stringify(db.reports || []));
                return;
            }
            if (resource === 'reports' && req.method === 'DELETE' && id) {
                if (!db.reports) db.reports = [];
                db.reports = db.reports.filter(r => r.id != id);
                writeDB(db);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true }));
                return;
            }

            if (!db[resource] && resource !== 'settings') {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Resource not found' }));
                return;
            }

            if (req.method === 'GET') {
                if (resource === 'settings') {
                    res.writeHead(200);
                    res.end(JSON.stringify(db.settings || {}));
                } else if (id) {
                    const item = db[resource].find(item => item.id == id);
                    if (item) { res.writeHead(200); res.end(JSON.stringify(item)); }
                    else { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); }
                } else {
                    res.writeHead(200);
                    res.end(JSON.stringify(db[resource]));
                }
            } else if (req.method === 'POST') {
                if (resource === 'settings') {
                    db.settings = { ...db.settings, ...JSON.parse(body) };
                    writeDB(db);
                    res.writeHead(200);
                    res.end(JSON.stringify(db.settings));
                } else {
                    const newItem = JSON.parse(body);
                    if (!newItem.id) newItem.id = Date.now().toString() + Math.random().toString().slice(2, 6);
                    db[resource].push(newItem);
                    writeDB(db);
                    res.writeHead(201);
                    res.end(JSON.stringify(newItem));
                }
            } else if (req.method === 'PUT') {
                if (resource === 'settings') {
                    db.settings = { ...db.settings, ...JSON.parse(body) };
                    writeDB(db);
                    res.writeHead(200);
                    res.end(JSON.stringify(db.settings));
                } else if (id) {
                    const updatedItem = JSON.parse(body);
                    const index = db[resource].findIndex(item => item.id == id);
                    if (index !== -1) {
                        db[resource][index] = { ...db[resource][index], ...updatedItem };
                        writeDB(db);
                        res.writeHead(200);
                        res.end(JSON.stringify(db[resource][index]));
                    } else {
                        res.writeHead(404);
                        res.end(JSON.stringify({ error: 'Not found' }));
                    }
                }
            } else if (req.method === 'DELETE') {
                if (id) {
                    const index = db[resource].findIndex(item => item.id == id);
                    if (index !== -1) {
                        db[resource].splice(index, 1);
                        writeDB(db);
                        res.writeHead(200);
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.writeHead(404);
                        res.end(JSON.stringify({ error: 'Not found' }));
                    }
                }
            }
        });
        return;
    }

    if (fs.existsSync(DIST_DIR)) {
        let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
        serveStatic(res, filePath);
    } else {

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('API server running. Use npm run dev for frontend in development.');
    }
});

const PORT = process.env.PORT || 5011;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    if (fs.existsSync(DIST_DIR)) {
        console.log(`   Frontend: http://localhost:${PORT}`);
    }
});
