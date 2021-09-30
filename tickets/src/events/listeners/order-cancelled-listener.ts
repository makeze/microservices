import {Listener, OrderCancelledEvent, Subjects} from "@maxytick/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    queueGroupName: string = queueGroupName;
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message): Promise<void> {
        // find the ticket
        const ticket = await Ticket.findById(data.ticket.id);
        if(!ticket) {
            throw new Error("Ticket not found!");
        }
        // edit ticket and save
        ticket.set({orderId: undefined});
        await ticket.save();
        // emit ticket updated event
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            orderId: ticket.orderId,
            userId: ticket.userId,
            price: ticket.price,
            title: ticket.title,
            version: ticket.version,
        })
        // acknowledge
        msg.ack();
    }
}