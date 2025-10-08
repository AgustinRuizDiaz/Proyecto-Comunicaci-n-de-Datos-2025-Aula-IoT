const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;

const server = http.createServer((req, res) => {
  console.log(`📡 ${req.method} ${req.url}`);

  if (req.url === '/') {
    // Servir el archivo index.html
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error interno del servidor');
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Archivo no encontrado');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor básico corriendo en http://localhost:${PORT}`);
});
