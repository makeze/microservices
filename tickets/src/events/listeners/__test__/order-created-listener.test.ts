import {OrderCreatedListener} from "../order-created-listener";
import {OrderCreatedEvent, OrderStatus} from "@maxytick/common";
import {Ticket} from "../../../models/ticket";
import {natsWrapper} from "../../../nats-wrapper";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";

const setup = async () => {
    // create an instance of a listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create a new ticket
    const ticket = Ticket.build({
        price: 49.99, title: "LP", userId: mongoose.Types.ObjectId().toHexString()
    });
    // save a ticket
    await ticket.save();

    // create fake data event
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: '123123123',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, ticket, data, msg};
}

it('sets the userId of the ticket', async () => {
    const {listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const {ticket, msg} = await setup();
    await ticket.save();
    msg.ack()
});

it('publishes a ticket updated event', async () => {
   const {listener, ticket, data, msg} = await setup();

   await listener.onMessage(data, msg);

   expect(natsWrapper.client.publish).toHaveBeenCalled();
});