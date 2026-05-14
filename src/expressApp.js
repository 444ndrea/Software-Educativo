const express = require('express');
const compression = require('compression');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// ----- MIDDLEWARES GLOBALES -----

// Habilita peticiones desde otros dominios
app.use(cors());

// Parsear el body JSON asegurando que limitamos el peso (ej. 5MB) para evitar saturar el ancho de banda
app.use(express.json({ limit: '5mb' }));

// Compresión GZIP: Extremadamente útil para conexiones de baja velocidad y payloads que crecen (ej: listas de flashcards)
app.use(compression()); 

// ----- RUTAS PRINCIPALES -----
app.use('/api', routes);

// Endpoint Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', msg: 'System healthy' });
});

// Fallback de errores globales
app.use((err, req, res, next) => {
  console.error('[Error Crítico]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
