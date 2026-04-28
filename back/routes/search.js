const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { uploadPath } = require('../utils/fileUtils');
const { createLoggerContext } = require('../utils/logger');
const { naiveSearch, naiveSearchWithLogs } = require('../algorithms/naive');
const { rabinKarpSearch, rabinKarpSearchWithLogs } = require('../algorithms/rabinKarp');
const { kmpSearch, kmpSearchWithLogs } = require('../algorithms/kmp');
const { boyerMooreSearch, boyerMooreSearchWithLogs } = require('../algorithms/boyerMoore');

const router = express.Router();
const upload = multer({ storage: multer.diskStorage({ destination: uploadPath, filename: (req, file, cb) => cb(null, file.originalname) }) });

router.post('/', upload.array('files'), (req, res) => {
    try {
        const { pattern, algorithm, stepByStep } = req.body;

        if (!pattern) return res.status(400).json({ message: 'Informe um padrão para busca.' });

        let arquivosParaBuscar = [];

        if (req.files && req.files.length > 0) {
            arquivosParaBuscar = req.files.map(f => ({ nome: f.originalname, caminho: f.path }));
        } else {
            const files = fs.readdirSync(uploadPath);
            if (files.length === 0) return res.status(400).json({ message: 'Nenhum arquivo disponível para busca.' });
            arquivosParaBuscar = files.map(f => ({ nome: f, caminho: path.join(uploadPath, f) }));
        }

        // limpa logs
        fs.writeFileSync('combined.log', '');
        fs.writeFileSync('error.log', '');

        const resultados = [];

        for (const file of arquivosParaBuscar) {
            const text = fs.readFileSync(file.caminho, 'utf-8');
            const log = stepByStep === 'true' ? createLoggerContext() : null;

            switch (algorithm) {
                case 'naive':
                    if (log) {
                        const r = naiveSearchWithLogs(text, pattern, log);
                        resultados.push({ arquivo: file.nome, ocorrencias: r.matches.length, posicoes: r.matches, metrics: r.metrics });
                    } else {
                        const start = performance.now();
                        const r = naiveSearch(text, pattern);
                        const end = performance.now();
                        resultados.push({ arquivo: file.nome, ocorrencias: r.matches.length, posicoes: r.matches, metrics: { comparisons: r.comparisons, executionTime: (end - start).toFixed(4), textLength: text.length, patternLength: pattern.length, complexity: 'O(n*m)' } });
                    }
                    break;

                case 'rabin':
                    if (log) {
                        const r = rabinKarpSearchWithLogs(text, pattern, log);
                        resultados.push({ arquivo: file.nome, ocorrencias: r.matches.length, posicoes: r.matches, metrics: r.metrics });
                    } else {
                        const start = performance.now();
                        const r = rabinKarpSearch(text, pattern);
                        const end = performance.now();
                        resultados.push({ arquivo: file.nome, ocorrencias: r.matches.length, posicoes: r.matches, metrics: { comparisons: r.comparisons, executionTime: (end - start).toFixed(4), textLength: text.length, patternLength: pattern.length, complexity: 'O(n+m)' } });
                    }
                    break;

                case 'kmp':
                    if (log) {
                        const r = kmpSearchWithLogs(text, pattern, log);
                        resultados.push({ arquivo: file.nome, ocorrencias: r.matches.length, posicoes: r.matches, metrics: r.metrics });
                    } else {
                        const start = performance.now();
                        const r = kmpSearch(text, pattern);
                        const end = performance.now();
                        resultados.push({ arquivo: file.nome, ocorrencias: r.matches.length, posicoes: r.matches, metrics: { comparisons: r.comparisons, executionTime: (end - start).toFixed(4), textLength: text.length, patternLength: pattern.length, complexity: 'O(n+m)' } });
                    }
                    break;

                case 'boyer':
                    if (log) {
                        const r = boyerMooreSearchWithLogs(text, pattern, log);
                        resultados.push({ arquivo: file.nome, ocorrencias: r.matches.length, posicoes: r.matches, metrics: r.metrics });
                    } else {
                        const start = performance.now();
                        const r = boyerMooreSearch(text, pattern);
                        const end = performance.now();
                        resultados.push({ arquivo: file.nome, ocorrencias: r.matches.length, posicoes: r.matches, metrics: { comparisons: r.comparisons, executionTime: (end - start).toFixed(4), textLength: text.length, patternLength: pattern.length, complexity: 'O(n/m) (melhor caso)' } });
                    }
                    break;

                default:
                    return res.status(400).json({ message: 'Algoritmo inválido' });
            }
        }

        res.json({ pattern, algorithm, resultados });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro interno' });
    }
});

module.exports = router;