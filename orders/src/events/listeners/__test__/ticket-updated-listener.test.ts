import {TicketUpdatedEvent} from "@maxytick/common";
import mongoose from "mongoose";
import {TicketUpdatedListener} from "../ticket-updated-listener";
import {Ticket} from "../../../models/ticket";
import {natsWrapper} from "../../../nats-wrapper";
import {Message} from "node-nats-streaming";

const setup = async () => {
    // create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 49.99,
        title: "lp"
    });
    await ticket.save();

    // create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: "meteora",
        price: ticket.price + 10,
        userId: mongoose.Types.ObjectId().toHexString()
    };

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    // return everything
    return {listener, ticket, data, msg};
}

it('finds, updates, saves a ticket', async () => {
    const {listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
    const {listener, data, msg} = await setup();

    data.version = 5;

    try {
        await listener.onMessage(data, msg);
    } catch (err) {

    }

    expect(msg.ack).not.toHaveBeenCalled();
});