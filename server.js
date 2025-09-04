const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

// Create the Next.js app
// Explicitly set the project directory and config to avoid cwd issues on cPanel
const app = next({
  dev,
  hostname,
  port,
  dir: path.resolve(__dirname),
  conf: require('./next.config.js'),
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse the request URL
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // API-only mode: only handle Next.js API routes
      if (pathname.startsWith('/api')) {
        await handle(req, res, parsedUrl);
        return;
      }

      // Health check endpoint for platform monitoring
      if (pathname === '/healthz') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('ok');
        return;
      }

      // Everything else: 404 to indicate no pages are served
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not Found');
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  process.exit(0);
});
