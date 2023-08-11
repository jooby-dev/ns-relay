// eslint-disable-next-line import/no-unresolved
import {UPLINK, DOWNLINK} from 'jooby-ns-tools/constants/eventTypes.js';

// sse listeners
// {'001a7988170187ca': [{requestId: {request, reply, messageId}}]}
const subscribers = new Map();

// only binary data in hex
// {'001a7988170187ca': '2003'}
const payloads = new Map();

const eventMap = {
    txack: DOWNLINK,
    up: UPLINK
};


export default (fastify, opts, done) => {
    fastify.post(
        '/webhook',
        {
            schema: {
                querystring: {
                    event: {type: 'string'}
                }
            }
        },
        async request => {
            const event = eventMap[request.query.event];

            if ( !event ) {
                // unnecessary events
                return;
            }

            const {body} = request;
            const {devEui: eui} = body.deviceInfo;
            const euiSubscribers = subscribers.get(eui);

            if ( euiSubscribers ) {
                let payload = body.data;

                // extend downlink message from buffer
                if ( event === DOWNLINK ) {
                    payload = payloads.get(eui)?.pop();
                }

                // convert to hex
                if ( payload ) {
                    payload = Buffer.from(payload, 'base64').toString('hex');
                }

                // should be used only once and then cleared
                payloads.delete(eui);

                for ( const subscriber of euiSubscribers.values() ) {
                    subscriber.reply.sse({
                        id: subscriber.messageId++,
                        data: JSON.stringify({
                            event,
                            eui,
                            time: body.time,
                            data: payload,
                            info: body
                        })
                    });
                    console.log('send sse to', subscriber.messageId);
                }
            }
        }
    );

    fastify.post(
        '/:id/messages',
        {},
        async ( request, reply ) => {
            const {id} = request.params;
            const {body} = request;
            const payload = payloads.get(id) || [];

            payload.push(body.data);
            payloads.set(id, payload);

            reply.send(true);
        }
    );

    fastify.get(
        '/sse',
        {
            schema: {
                querystring: {
                    eui: {type: 'string'}
                }
            }
        },
        async ( request, reply ) => {
            const euiList = request.query.eui.split(',');
            let messageId = 1;

            reply.sse({id: messageId++, event: 'ready', data: true});

            euiList.forEach(eui => {
                const euiSubscribers = subscribers.get(eui) || new Map();

                euiSubscribers.set(request.id, {request, reply, messageId: messageId++});
                subscribers.set(eui, euiSubscribers);

                request.socket.on('close', () => {
                    euiSubscribers.delete(request.id);
                });
            });
        }
    );

    done();
};
