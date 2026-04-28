const { performance } = require('perf_hooks');

function buildLPS(pattern) {
    const lps = Array(pattern.length).fill(0);
    let len = 0, i = 1;

    while (i < pattern.length) {
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len !== 0) len = lps[len - 1];
            else { lps[i] = 0; i++; }
        }
    }
    return lps;
}

function kmpSearch(text, pattern) {
    const result = [];
    const lps = buildLPS(pattern);
    let comparisons = 0;
    let i = 0, j = 0;

    while (i < text.length) {
        comparisons++;
        if (text[i] === pattern[j]) { i++; j++; }

        if (j === pattern.length) {
            result.push(i - j);
            j = lps[j - 1];
        } else if (i < text.length && text[i] !== pattern[j]) {
            if (j !== 0) j = lps[j - 1];
            else i++;
        }
    }

    return { matches: result, metrics: { comparisons, textLength: text.length, patternLength: pattern.length, complexity: 'O(n+m)' } };
}

function kmpSearchWithLogs(text, pattern, log) {
    const result = [];
    const lps = buildLPS(pattern);
    let comparisons = 0;
    let i = 0, j = 0;
    const startTime = performance.now();

    log.section('KMP');
    log.log(`LPS: ${lps.join(', ')}`);

    while (i < text.length) {
        comparisons++;
        log.log(`Comparando text[${i}]='${text[i]}' com pattern[${j}]='${pattern[j]}'`);
        if (text[i] === pattern[j]) { log.match('Match'); i++; j++; }

        if (j === pattern.length) {
            log.match(`Encontrado na posição ${i - j}`);
            result.push(i - j);
            j = lps[j - 1];
        } else if (i < text.length && text[i] !== pattern[j]) {
            log.error('Mismatch');
            if (j !== 0) {
                const old = j;
                j = lps[j - 1];
                log.step(`LPS: ${old} -> ${j}`);
            } else { i++; }
        }

        log.divider();
    }

    const endTime = performance.now();
    return { matches: result, metrics: { comparisons, executionTime: (endTime - startTime).toFixed(4), textLength: text.length, patternLength: pattern.length, complexity: 'O(n+m)' } };
}

module.exports = { kmpSearch, kmpSearchWithLogs };