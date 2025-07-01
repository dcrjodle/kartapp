/**
 * Production server for Swedish Statistics Visualization Platform
 * Serves static files and handles SPA routing
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Static file serving
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// API endpoints can be added here if needed
app.get('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API not implemented', 
    message: 'This is a static file server. API endpoints should be implemented separately.' 
  });
});

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <html>
        <head><title>Build Required</title></head>
        <body>
          <h1>Application Not Built</h1>
          <p>Please run <code>npm run build</code> to build the application first.</p>
          <p>Then run <code>npm start</code> to serve the built application.</p>
        </body>
      </html>
    `);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`📍 Access the application at: http://localhost:${PORT}`);
  console.log(`💚 Health check available at: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully');
  process.exit(0);
});