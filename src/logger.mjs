'use strict';

import { createLogger, format, transports } from 'winston';

const logLevel = process.env.LOGLEVEL || 'info';

const winstonLogger = createLogger({
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.colorize(),
        format.timestamp(),
        format.align(),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    level: logLevel,
    transports: [
        new transports.Console()
    ],
});

const writeLogType = (logLevel) => {
    return function () {
        const args = Array.from(arguments);
        winstonLogger[logLevel](args.join(' '));
    };
};

const logger = {
    silly: writeLogType('silly'),
    debug: writeLogType('debug'),
    verbose: writeLogType('verbose'),
    info: writeLogType('info'),
    warn: writeLogType('warn'),
    error: writeLogType('error'),
};

export default logger;
