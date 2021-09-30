import mongoose from 'mongoose';
import express, {Request, Response} from 'express';
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from "@maxytick/common";
import {body} from 'express-validator';
import {Ticket} from "../models/ticket";
import {Order} from "../models/order";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

const CART_EXPIRATION_TIME = 15;

router.post('/api/orders/', requireAuth, [
        body('ticketId')
            .not()
            .isEmpty()
            .withMessage('TicketId must be provided')
    ], validateRequest,
    async (req: Request, res: Response) => {
        const {ticketId} = req.body;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }

        if (await ticket.isReserved()) {
            throw new BadRequestError('Ticked is already booked');
        }

        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + CART_EXPIRATION_TIME);

        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });
        await order.save();

        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: ticket.id,
                price: ticket.price
            }
        });

        res.status(201).send(order);
    });

export {router as newOrderRouter}