const { performance } = require('perf_hooks');

function buildBadCharTable(pattern) {
    const table = {};
    for (let i = 0; i < pattern.length; i++) table[pattern[i]] = i;
    return table;
}

function boyerMooreSearch(text, pattern) {
    const result = [];
    let comparisons = 0;
    const badChar = buildBadCharTable(pattern);
    let shift = 0;

    while (shift <= text.length - pattern.length) {
        let j = pattern.length - 1;
        while (j >= 0) {
            comparisons++;
            if (pattern[j] !== text[shift + j]) break;
            j--;
        }
        if (j < 0) {
            result.push(shift);
            shift += (shift + pattern.length < text.length) ? pattern.length - (badChar[text[shift + pattern.length]] ?? -1) : 1;
        } else {
            shift += Math.max(1, j - (badChar[text[shift + j]] ?? -1));
        }
    }

    return { matches: result, metrics: { comparisons, textLength: text.length, patternLength: pattern.length, complexity: 'O(n/m) (melhor caso)' } };
}

function boyerMooreSearchWithLogs(text, pattern, log) {
    const result = [];
    let comparisons = 0;
    const badChar = buildBadCharTable(pattern);
    let shift = 0;
    const startTime = performance.now();

    log.section('BOYER-MOORE');
    log.log(`Tabela Bad Character: ${JSON.stringify(badChar)}`);

    while (shift <= text.length - pattern.length) {
        log.step(`[SHIFT] ${shift}`);
        let j = pattern.length - 1;
        while (j >= 0) {
            comparisons++;
            log.log(`Comparando text[${shift + j}]='${text[shift + j]}' com pattern[${j}]='${pattern[j]}'`);
            if (pattern[j] !== text[shift + j]) { log.error('Mismatch'); break; }
            log.match('Match'); j--;
        }

        if (j < 0) {
            log.match(`Encontrado na posição ${shift}`);
            result.push(shift);
            const nextShift = (shift + pattern.length < text.length) ? pattern.length - (badChar[text[shift + pattern.length]] ?? -1) : 1;
            log.step(`Deslocamento após match: ${nextShift}`);
            shift += nextShift;
        } else {
            const badCharIndex = badChar[text[shift + j]] ?? -1;
            const shiftAmount = Math.max(1, j - badCharIndex);
            log.step(`BadChar='${text[shift + j]}', índice no pattern=${badCharIndex}, shift=${shiftAmount}`);
            shift += shiftAmount;
        }

        log.divider();
    }

    const endTime = performance.now();
    log.section('RESULTADO');

    return { matches: result, metrics: { comparisons, executionTime: (endTime - startTime).toFixed(4), textLength: text.length, patternLength: pattern.length, complexity: 'O(n/m) (melhor caso)' } };
}

module.exports = { boyerMooreSearch, boyerMooreSearchWithLogs };