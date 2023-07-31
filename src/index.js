import Fastify from 'fastify';
import cors from '@fastify/cors';
import {FastifySSEPlugin} from 'fastify-sse-v2';
import config from './config.js';
import routes from './routes/index.js';


let requestIndex = 1;

const fastify = Fastify({
    logger: config.pino,
    genReqId: () => requestIndex++
});


fastify.register(FastifySSEPlugin);
fastify.register(cors, {});
fastify.register(routes);

fastify.ready(() => fastify.log.info(`\n${fastify.printRoutes()}`));

// start
fastify
    .listen(config.http)
    .catch(error => {
        fastify.log.error(error);
        process.exit(1);
    });
