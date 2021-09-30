import request from "supertest";
import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import mongoose from "mongoose";

it('fetches the order', async () => {
    // create ticket
    const ticket = Ticket.build({
        title: 'lp',
        price: 39.90,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    const user = global.signin();
    const userTwo = global.signin();

    // make a request to build an order with this ticket
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);
    //make request
    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);
    expect(fetchedOrder.id).toEqual(order.id);

    //make request
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(404);
    expect(fetchedOrder.id).toEqual(order.id);
});