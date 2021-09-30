import request from 'supertest';
import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import {Order, OrderStatus} from '../../models/order';
import mongoose from "mongoose";

it('should cancel the order', async () => {
    // create a ticket with ticket model
    const ticket = Ticket.build({
        title: 'lp',
        price: 39.99,
        id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();

    // make request to create an order
    const user = global.signin();
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);

    // make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    // expect
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it.todo('emits an order cancelled event');