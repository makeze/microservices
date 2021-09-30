import {Message} from 'node-nats-streaming';
import {Listener, Subjects, TicketCreatedEvent} from "@maxytick/common";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    queueGroupName = queueGroupName;
    subject: Subjects.TicketCreated = Subjects.TicketCreated;

    async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
        const {id, title, price} = data;
        const ticket = Ticket.build({
            id,
            title,
            price
        });
        await ticket.save();
        msg.ack();
    }
}