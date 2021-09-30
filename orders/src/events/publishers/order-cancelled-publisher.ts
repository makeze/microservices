import {OrderCancelledEvent, Publisher, Subjects} from "@maxytick/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}