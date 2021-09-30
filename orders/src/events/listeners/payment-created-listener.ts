import {Listener, NotFoundError, OrderStatus, PaymentCreatedEvent, Subjects} from "@maxytick/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    async onMessage(data: PaymentCreatedEvent["data"], msg: Message): Promise<void> {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new NotFoundError();
        }

        order.set({
           status: OrderStatus.Complete
        });
        await order.save();

        msg.ack();
    }

    queueGroupName = queueGroupName;
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}