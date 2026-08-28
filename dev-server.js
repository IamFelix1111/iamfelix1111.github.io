// @ts-nocheck — suppress @types/node Buffer generic noise in this dev utility.
// Local HTTPS dev server with auto-refresh (zero dependencies)
// Serves the src/ directory (which maps to the site root after deployment).
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, 'src');
const PORT = 8000;
const cert = fs.readFileSync(path.join(__dirname, 'cert.pem'));
const key = fs.readFileSync(path.join(__dirname, 'key.pem'));

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.json': 'application/json; charset=utf-8',
};

// Content hash of all files, used to detect changes.
function snapshot() {
    const hash = crypto.createHash('sha256');
    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (entry.isFile()) {
                hash.update(entry.name);
                hash.update(fs.readFileSync(full));
            }
        }
    }
    walk(ROOT);
    return hash.digest('hex');
}

let current = snapshot();

// Poll for changes (more reliable than fs.watch across platforms).
setInterval(() => {
    const next = snapshot();
    if (next !== current) {
        current = next;
        console.log('[dev] Files changed, notifying browser to reload');
    }
}, 500);

// Injected into every HTML page: polls a token and reloads when it changes.
const reloadScript = `
<script>
(function () {
    let token = null;
    function check() {
        const req = new XMLHttpRequest();
        req.open('GET', '/__reload_check?t=' + Date.now());
        req.onload = function () {
            const next = req.responseText;
            if (token !== null && token !== next) location.reload();
            token = next;
        };
        req.send();
    }
    setInterval(check, 500);
})();
</script>`;

https.createServer({ cert, key }, (req, res) => {
    const url = new URL(req.url, `https://localhost:${PORT}`);

    if (url.pathname === '/__reload_check') {
        res.setHeader('Cache-Control', 'no-store');
        res.end(current);
        return;
    }

    let filePath = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
    if (url.pathname === '/' || filePath === ROOT) {
        filePath = path.join(ROOT, 'index.html');
    }
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
        res.statusCode = 403;
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stat) => {
        if (!err && stat.isDirectory()) filePath = path.join(filePath, 'index.html');
        fs.readFile(filePath, (err2, data) => {
            if (err2) {
                fs.readFile(path.join(ROOT, '404.html'), (e2, d2) => {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    res.end(e2 ? 'Not Found' : d2);
                });
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'no-store');
            if (ext === '.html') data = Buffer.concat([data, Buffer.from(reloadScript)]);
            res.end(data);
        });
    });
}).listen(PORT, () => {
    console.log(`Dev server running at https://localhost:${PORT} (auto-refresh on)`);
});
