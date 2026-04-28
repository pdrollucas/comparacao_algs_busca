const { performance } = require('perf_hooks');

function rabinKarpSearch(text, pattern) {
    const result = [];
    let comparisons = 0;

    const d = 256; // caracteres possíveis
    const q = 101; // número primo para hash
    const m = pattern.length;
    const n = text.length;

    let p = 0; // hash pattern
    let t = 0; // hash da janela
    let h = 1;

    for (let i = 0; i < m - 1; i++) h = (h * d) % q;

    for (let i = 0; i < m; i++) {
        p = (d * p + pattern.charCodeAt(i)) % q;
        t = (d * t + text.charCodeAt(i)) % q;
    }

    for (let i = 0; i <= n - m; i++) {
        if (p === t) {
            let match = true;
            for (let j = 0; j < m; j++) {
                comparisons++;
                if (text[i + j] !== pattern[j]) {
                    match = false;
                    break;
                }
            }
            if (match) result.push(i);
        }

        if (i < n - m) {
            t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
            if (t < 0) t += q;
        }
    }

    return { matches: result, metrics: { comparisons, textLength: n, patternLength: m, complexity: 'O(n+m)' } };
}

function rabinKarpSearchWithLogs(text, pattern, log) {
    const result = [];
    const d = 256;
    const q = 101;
    const m = pattern.length;
    const n = text.length;

    let p = 0, t = 0, h = 1, comparisons = 0;
    const startTime = performance.now();

    log.section('RABIN-KARP');

    for (let i = 0; i < m - 1; i++) h = (h * d) % q;
    log.log(`h = ${h}`);

    for (let i = 0; i < m; i++) {
        p = (d * p + pattern.charCodeAt(i)) % q;
        t = (d * t + text.charCodeAt(i)) % q;
    }

    log.log(`Hash pattern = ${p}, Hash inicial texto = ${t}`);

    for (let i = 0; i <= n - m; i++) {
        log.step(`[SHIFT] i = ${i}`);

        if (p === t) {
            log.match('Hash bateu, verificando caracteres');
            let match = true;
            for (let j = 0; j < m; j++) {
                comparisons++;
                if (text[i + j] !== pattern[j]) {
                    log.error('Falso positivo (colisão)');
                    match = false;
                    break;
                }
            }
            if (match) {
                log.match(`Encontrado na posição ${i}`);
                result.push(i);
            }
        } else log.error('Hash diferente');

        if (i < n - m) {
            const old = t;
            t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
            if (t < 0) t += q;
            log.log(`Rolling hash: ${old} -> ${t}`);
        }

        log.divider();
    }

    const endTime = performance.now();

    return { matches: result, metrics: { comparisons, executionTime: (endTime - startTime).toFixed(4), textLength: n, patternLength: m, complexity: 'O(n+m)' } };
}

module.exports = { rabinKarpSearch, rabinKarpSearchWithLogs };