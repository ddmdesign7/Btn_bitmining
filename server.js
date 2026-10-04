import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// Check if production build exists in dist directory
const distPath = path.join(__dirname, 'dist');
const staticDir = fs.existsSync(distPath) ? distPath : __dirname;

// Serve static assets from dist or root fallback
app.use(express.static(staticDir));

// Health check endpoint for Cloud Run
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// SPA fallback: any request not matched by static files gets index.html
app.use((req, res) => {
  const indexHtml = fs.existsSync(path.join(distPath, 'index.html'))
    ? path.join(distPath, 'index.html')
    : path.join(__dirname, 'index.html');
  res.sendFile(indexHtml);
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT} (serving from ${staticDir})`);
});

// Handle graceful shutdown on container stops
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
