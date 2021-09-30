import {Order} from "../../models/order";
import mongoose from "mongoose";
import {OrderStatus} from "@maxytick/common";
import {app} from "../../app";
import request from "supertest";
import {stripe} from "../../stripe";
import {Payment} from "../../models/payment";

const setup = async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 49.99
    });
}

it ('should successfully pay the order', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: '123',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it ('fail when an order does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: '123',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it ('should return unauthorized if the wrong user is trying to pay the order', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 49.99
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: '123',
            orderId: order.id
        })
        .expect(401);
});

it ('should return bad request if the order is already cancelled', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: userId,
        status: OrderStatus.Cancelled,
        price: 49.99
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: '123',
            orderId: order.id
        })
        .expect(400);
});

it('returns a 201 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price,
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id,
        })
        .expect(201);

    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find((charge) => {
        return charge.amount === price * 100;
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');

    const payment = await Payment.findOne({
       orderId: order.id,
       stripeId: stripeCharge!.id
    });
    expect(payment).not.toBeNull();
});