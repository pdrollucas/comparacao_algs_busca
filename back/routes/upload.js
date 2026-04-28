const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadPath } = require('../utils/fileUtils');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

router.post('/', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'Nenhum arquivo enviado.' });

    const fileNames = req.files.map(f => f.originalname);
    res.json({ message: 'Upload realizado com sucesso!', files: fileNames });
});

module.exports = router;