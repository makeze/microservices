import {Listener, OrderCreatedEvent, Subjects} from "@maxytick/common";
import { queueGroupName } from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {expirationQueue} from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    async onMessage(data: OrderCreatedEvent["data"], msg: Message): Promise<void> {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log("waiting for ", 15);
        await expirationQueue.add({
           orderId: data.id
        }, {
            delay: 30000
        });
        msg.ack();
    }

    queueGroupName = queueGroupName;
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

}