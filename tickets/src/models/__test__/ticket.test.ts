import {Ticket} from "../ticket";

it('implements optimistic concurrency control', async () => {
    // create an instance of a ticket
    const ticket = Ticket.build({
        title: 'lp',
        price: 49.99,
        userId: "123"
    });
    // save the ticket to db
    await ticket.save();

    // fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // make two separate changes to the tickets we have fetched
    firstInstance!.set({price: 10});
    secondInstance!.set({price: 15});

    // save the first fetched ticket
    await firstInstance!.save();

    // save the second fetched ticket and expect an error
    try {
        await secondInstance!.save();
    } catch (err) {
        const secondInstance = await Ticket.findById(ticket.id);
        secondInstance!.set({price: 15});
        await secondInstance!.save();
        return;
    }

    throw new Error('Concurrency problem occurred');
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'lp',
        price: 39.99,
        userId: '123'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});