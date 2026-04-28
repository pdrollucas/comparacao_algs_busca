const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(label({ label: 'LOG' }), timestamp(), logFormat),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

function createLoggerContext() {
    return {
        log: (msg) => msg.split('\n').forEach(line => { if (line.trim()) logger.info(line.trim()); }),
        section: (title) => { logger.info(`\n========== ${title} ==========\n`); },
        step: (msg) => { logger.info(`→ ${msg}`); },
        match: (msg) => { logger.info(`✔ ${msg}`); },
        error: (msg) => { logger.info(`✖ ${msg}`); },
        divider: () => { logger.info('----------------------------------------'); }
    };
}

module.exports = { logger, createLoggerContext };