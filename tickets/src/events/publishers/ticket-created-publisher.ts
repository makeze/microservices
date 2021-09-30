import {Publisher, Subjects, TicketCreatedEvent} from "@maxytick/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}