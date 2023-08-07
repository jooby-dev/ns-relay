// sse listeners
// {'eui-001a798816012b96': [{requestId: {request, reply, messageId}}]}
const subscribers = new Map();

// only binary data in hex
// {'eui-001a798816012b96': '2ef3'}
const payloads = new Map();


export default async fastify => {
    fastify.post(
        '/webhook',
        async request => {
            const {body} = request;
            const {device_id: id} = body.end_device_ids;
            const subscribers = subscribersMap.get(id);

            if ( subscribers ) {
                let payload = body?.downlink_message?.frm_payload;

                // extend downlink message from buffer
                if ( payload ) {
                    payload = payloads.get(id)?.pop();
                    // should be used only once and then cleared
                    payloads.delete(id);
                } else {
                    payload = body?.uplink_message?.frm_payload;
                }

                // convert to hex
                if ( payload ) {
                    payload = Buffer.from(payload, 'base64').toString('hex');
                }

                for ( const subscriber of subscribers.values() ) {
                    subscriber.reply.sse({
                        id: subscriber.messageId++,
                        data: JSON.stringify({
                            id,
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
