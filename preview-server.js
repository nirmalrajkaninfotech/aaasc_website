#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3002;
const BUILD_DIR = path.join(__dirname, 'out');

// Check if build directory exists
if (!fs.existsSync(BUILD_DIR)) {
    console.error('❌ Build directory not found!');
    console.log('Please run "npm run build:static" first to generate the static files.');
    process.exit(1);
}

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Remove trailing slash except for root
    if (pathname !== '/' && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
    }

    let filePath = path.join(BUILD_DIR, pathname);

    // Try different file resolution strategies
    let finalPath = null;

    // 1. Check if it's a direct file
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        finalPath = filePath;
    }
    // 2. Check if it's a directory with index.html
    else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        finalPath = path.join(filePath, 'index.html');
    }
    // 3. Check if adding .html works
    else if (fs.existsSync(filePath + '.html')) {
        finalPath = filePath + '.html';
    }
    // 4. For root path
    else if (pathname === '/' || pathname === '') {
        finalPath = path.join(BUILD_DIR, 'index.html');
    }
    // 5. Fallback to 404 or index.html
    else {
        if (fs.existsSync(path.join(BUILD_DIR, '404.html'))) {
            finalPath = path.join(BUILD_DIR, '404.html');
            res.statusCode = 404;
        } else {
            finalPath = path.join(BUILD_DIR, 'index.html');
            res.statusCode = 404;
        }
    }

    if (finalPath && fs.existsSync(finalPath)) {
        const ext = path.extname(finalPath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);

        const fileStream = fs.createReadStream(finalPath);
        fileStream.pipe(res);

        fileStream.on('error', (err) => {
            res.statusCode = 500;
            res.end('Internal Server Error');
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log('🚀 Static preview server started!');
    console.log(`📁 Serving files from: ${BUILD_DIR}`);
    console.log(`🌐 Preview URL: http://localhost:${PORT}`);
    console.log('');
    console.log('Available pages:');
    console.log('  • Home: http://localhost:' + PORT);
    console.log('  • About: http://localhost:' + PORT + '/about');
    console.log('  • Facilities: http://localhost:' + PORT + '/facilities');
    console.log('  • Faculty: http://localhost:' + PORT + '/faculty');
    console.log('  • Contact: http://localhost:' + PORT + '/contact');
    console.log('  • Gallery: http://localhost:' + PORT + '/gallery');
    console.log('  • Categories: http://localhost:' + PORT + '/categories');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down preview server...');
    server.close(() => {
        process.exit(0);
    });
});