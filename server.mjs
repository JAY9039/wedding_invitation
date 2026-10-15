import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('./dist/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon' };
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) { res.writeHead(403).end(); return; }
    if (!(await stat(file)).isFile()) throw new Error('Not a file');
    const content = await readFile(file);
    const contentType = types[path.extname(file)] || 'application/octet-stream';
    const range = req.headers.range;
    if (path.extname(file) === '.mp3' && range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) {
        res.writeHead(416, { 'Content-Range': `bytes */${content.length}` }).end();
        return;
      }
      const suffixLength = Number(match[2]);
      const start = match[1] ? Number(match[1]) : Math.max(0, content.length - suffixLength);
      const end = match[1]
        ? Math.min(match[2] ? Number(match[2]) : content.length - 1, content.length - 1)
        : content.length - 1;
      if (start >= content.length || end < start) {
        res.writeHead(416, { 'Content-Range': `bytes */${content.length}` }).end();
        return;
      }
      const chunk = content.subarray(start, end + 1);
      res.writeHead(206, {
        'Content-Type': contentType,
        'Content-Range': `bytes ${start}-${end}/${content.length}`,
        'Content-Length': chunk.length,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      });
      res.end(chunk);
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length,
      ...(path.extname(file) === '.mp3' ? { 'Accept-Ranges': 'bytes' } : {}),
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
