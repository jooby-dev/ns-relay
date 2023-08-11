// eslint-disable-next-line import/no-unresolved
import {UPLINK, DOWNLINK} from 'jooby-ns-tools/constants/eventTypes.js';

// sse listeners
// {'eui-001a798816012b96': [{requestId: {request, reply, messageId}}]}
const subscribersMap = new Map();


export default async fastify => {
    fastify.post(
        '/webhook',
        async request => {
            const {body} = request;
            const {downlink_sent: downlink, uplink_message: uplink} = body;

            if ( !downlink || !uplink ) {
                // unnecessary events
                return;
            }

            const event = uplink ? UPLINK : DOWNLINK;
            const {device_id: id} = body.end_device_ids;
            const subscribers = subscribersMap.get(id);

            if ( subscribers ) {
                const base64Payload = event === UPLINK ? uplink.frm_payload : downlink.frm_payload;
                const payload = Buffer.from(base64Payload, 'base64').toString('hex');

                for ( const subscriber of subscribers.values() ) {
                    subscriber.reply.sse({
                        id: subscriber.messageId++,
                        data: JSON.stringify({
                            id,
                            event,
                            time: new Date(body.received_at).getTime(),
                            data: payload,
                            info: body
                        })
                    });
                    console.log('send sse to', subscriber.messageId);
                }
            }
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
            const idList = request.query.id.split(',');
            let messageId = 1;

            reply.sse({id: messageId++, event: 'ready', data: true});

            idList.forEach(id => {
                const subscribers = subscribersMap.get(id) || new Map();

                subscribers.set(request.id, {request, reply, messageId: messageId++});
                subscribers.set(id, subscribers);

                request.socket.on('close', () => {
                    subscribers.delete(request.id);
                });
            });
        }
    );
};
