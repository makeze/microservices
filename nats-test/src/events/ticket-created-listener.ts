import {Message} from 'node-nats-streaming';
import {Listener} from './base-listener';
import {Subjects} from "./subjects";
import {TicketCreatedEvent} from "./ticket-created-event";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    queueGroupName = 'payments-service';
    subject: Subjects.TicketCreated = Subjects.TicketCreated;

    onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
        console.log(`Event data!`, data);
        console.log(data.id);
        console.log(data.title);
        console.log(data.price);
        msg.ack();
    }

}