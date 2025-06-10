import { createLogger, format, Logger, transports } from "winston";

export default function(): Logger
{
    const logger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.errors({ stack: true }),
            format.splat(),
            format.simple()
        ),
        defaultMeta: { service: 'jukebox-app' },
        transports: [
            //
            // - Write to all logs with level `info` and below to `quick-start-combined.log`.
            // - Write all logs error (and below) to `quick-start-error.log`.
            //
            new transports.File({ filename: 'application-error.log', level: 'error' }),
            new transports.File({ filename: 'application-combined.log' })
        ]
    });
    
    logger.info('## LOGGER STARTED ######################################### ');
    return logger;
}