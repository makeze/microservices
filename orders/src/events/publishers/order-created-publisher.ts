import { Publisher, OrderCreatedEvent, Subjects } from '@maxytick/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}