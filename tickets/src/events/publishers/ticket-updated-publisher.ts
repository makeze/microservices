import {Publisher, Subjects, TicketUpdatedEvent} from "@maxytick/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}