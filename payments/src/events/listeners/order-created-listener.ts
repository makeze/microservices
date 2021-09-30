import {Listener, OrderCreatedEvent, Subjects} from "@maxytick/common";
import {queueGroupNames} from "./queue-group-names";
import {Message} from 'node-nats-streaming';
import {Order} from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    async onMessage(data: OrderCreatedEvent["data"], msg: Message): Promise<void> {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        });
        await order.save();
        msg.ack();
    }

    queueGroupName = queueGroupNames;
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

}