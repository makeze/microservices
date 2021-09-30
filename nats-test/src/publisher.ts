import * as nats from 'node-nats-streaming';
import {TicketCreatedPublisher} from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222'
});

stan.on('connect', async () => {
    console.log('Publisher connected to NATS');

    const publisher = new TicketCreatedPublisher(stan);
    try {
        await publisher.publish({
            id: '1337',
            title: 'linkin-park',
            price: 25
        });
    } catch (err) {
        console.error(err);
    }

    // const publisher = new TicketCreatedPublisher(stan);
    // try {
    //     await publisher.publish({
    //         id: '123',
    //         title: 'music',
    //         price: 39.99
    //     })
    // } catch (err) {
    //     console.error(err);
    // }
});