import getEnvBoolean from './utils/get.env.boolean.js';


const {env} = process;

export const http = {
    host: env.HTTP_HOST || '0.0.0.0',
    port: env.HTTP_PORT || 3000
};

export const pino = {
    level: env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            ignore: 'pid,hostname,req.req.hostname,req.req.remoteAddress,req.req.remotePort',
            colorize: getEnvBoolean('LOG_ENABLE_COLORIZE', true),
            translateTime: 'yyyy.mm.dd HH:MM:ss.l'
        }
    }
};

const config = {
    http,
    pino
};

export default config;
