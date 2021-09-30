import {natsWrapper} from "../../../nats-wrapper";
import {OrderCancelledListener} from "../order-cancelled-listener";
import mongoose from "mongoose";
import {Ticket} from "../../../models/ticket";
import {OrderCancelledEvent} from "@maxytick/common";
import {Message} from "node-nats-streaming";
import request from "supertest";
import {app} from "../../../app";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'lp',
        price: 49.99,
        userId: mongoose.Types.ObjectId().toHexString()
    });
    ticket.set({orderId});
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {msg, data, ticket, orderId, listener};
}

it('update the ticket, publishes an event and acks the message', async () => {
    const {msg, data, ticket, orderId, listener} = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});