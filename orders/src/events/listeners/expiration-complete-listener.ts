import {ExpirationComleteEvent, Listener, NotFoundError, OrderStatus, Subjects} from "@maxytick/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Order} from "../../models/order";
import {OrderCancelledPublisher} from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationComleteEvent> {
    queueGroupName = queueGroupName;
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

    async onMessage(data: ExpirationComleteEvent["data"], msg: Message): Promise<void> {
        const order = await Order.findById(data.orderId).populate('ticket');

        if (!order) {
            throw new NotFoundError();
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled
        })
        await order.save();

        await new OrderCancelledPublisher(this.client).publish(
            {
                id: order.id,
                version: order.version,
                ticket: {
                    id: order.ticket.id
                }
            }
        )
        msg.ack();
    }
}