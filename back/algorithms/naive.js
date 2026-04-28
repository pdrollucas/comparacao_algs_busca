const { performance } = require('perf_hooks');

function naiveSearch(text, pattern) {
    const result = [];
    let comparisons = 0;

    for (let i = 0; i <= text.length - pattern.length; i++) {
        let j = 0;
        while (j < pattern.length) {
            comparisons++;
            if (text[i + j] !== pattern[j]) break;
            j++;
        }
        if (j === pattern.length) result.push(i);
    }

    return { matches: result, metrics: { comparisons, textLength: text.length, patternLength: pattern.length, complexity: 'O(n*m)' } };
}

function naiveSearchWithLogs(text, pattern, log) {
    const result = [];
    let comparisons = 0;
    const startTime = performance.now();

    log.section('NAIVE SEARCH');

    for (let i = 0; i <= text.length - pattern.length; i++) {
        log.step(`[SHIFT] i = ${i}`);
        let j = 0;
        while (j < pattern.length) {
            comparisons++;
            log.log(`Comparando text[${i+j}]='${text[i+j]}' com pattern[${j}]='${pattern[j]}'`);
            if (text[i+j] !== pattern[j]) {
                log.error('Mismatch');
                if (j !== 0) log.step('Voltando ao início do padrão');
                break;
            }
            log.match('Match');
            j++;
        }
        if (j === pattern.length) {
            log.match(`Encontrado na posição ${i}`);
            result.push(i);
            log.divider();
        }
    }

    const endTime = performance.now();

    return {
        matches: result,
        metrics: {
            comparisons,
            executionTime: (endTime - startTime).toFixed(4),
            textLength: text.length,
            patternLength: pattern.length,
            complexity: "O(n*m)"
        }
    };
}

module.exports = { naiveSearch, naiveSearchWithLogs };