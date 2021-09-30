export enum OrderStatus {
  // order created, but the ticket is not yet reserved
  Created = 'created',
  // user cancels an order, or when the user is trying to reserve a booked ticket
  Cancelled = 'cancelled',
  // user successfully reserved a ticket
  AwaitingPayment = 'awaiting:payment',
  // user has reserved a ticket and has provided payment successfully
  Complete = 'complete'
}