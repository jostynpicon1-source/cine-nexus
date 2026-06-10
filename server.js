// Importamos Express para crear el servidor web
const express = require('express');
const path = require('path');

// Inicializamos la aplicación Express
const app = express();

// Configuramos el puerto del servidor
const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos (CSS, JS, imágenes, HTML)
app.use(express.static(path.join(__dirname)));

// Ruta principal que sirve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para páginas adicionales
app.get('/pages/:page', (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, 'pages', page));
});

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║     🎬 CineNexus Server Iniciado 🎬       ║
  ║     Servidor corriendo en puerto ${PORT}      ║
  ║     http://localhost:${PORT}                 ║
  ╚════════════════════════════════════════════╝
  `);
});