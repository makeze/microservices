import mongoose from "mongoose";
import {Ticket} from "../../../models/ticket";
import {TicketCreatedEvent} from "@maxytick/common";
import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Message} from "node-nats-streaming";


const setup = async () => {
    // create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);
    // save a fake data event
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "lp",
        price: 49.99,
        userId: new mongoose.Types.ObjectId().toHexString()
    }
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg};
}

it('creates and saves a ticket async', async () => {
    const {listener, data, msg} = await setup();
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);
    // write assertion to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
})

it('acks the message', async () => {
    const {listener, data, msg} = await setup();
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);
    // write assertion to make sure a ticket was created
    expect(msg.ack).toHaveBeenCalled();
})