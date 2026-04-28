const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');
const searchRoutes = require('./routes/search');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/upload', uploadRoutes);
app.use('/search', searchRoutes);

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});