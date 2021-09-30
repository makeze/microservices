import {PaymentCreatedEvent, Publisher, Subjects} from "@maxytick/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}