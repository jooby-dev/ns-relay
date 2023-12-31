import chirpstack from './chirpstack.js';
import ttn from './ttn.js';


export default async ( fastify, opts, done ) => {
    // this route required to inform nginx about service status
    fastify.get('/health', ( request, reply ) => {
        reply.type('text/plain').send('I\'m alive!');
    });

    fastify.register(chirpstack, {prefix: 'chirpstack'});
    fastify.register(ttn, {prefix: 'ttn'});

    done();
};
