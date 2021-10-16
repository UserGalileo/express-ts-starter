import { Application } from 'express';
import { PassportStatic } from 'passport';
import { authGuard } from '../guards/auth.guard';
import { cardStore, contactStore } from '../store';
import { v4 as uuid } from 'uuid';
import { Contact } from '../models/contact';

export function setupRoutes(app: Application, passport: PassportStatic) {

  app.get('/cards', authGuard, (req, res) => {
    cardStore.find({}, (err, cards) => {
      res.json(cards);
    })
  });

  app.post('/cards', authGuard, (req, res) => {
    cardStore.insert({
      ...req.body,
      owner: req.user?.displayName || 'Mario Rossi',
      ownerId: req.user?._id || '1',
      amount: 2000,
      movements: [
        {
          _id: uuid(),
          type: 'in',
          amount: 500,
          title: 'Lorem Ipsum',
          description: 'Lorem ipsum dolor sit amet',
          timestamp: Date.now(),
        },
        {
          _id: uuid(),
          type: 'in',
          amount: 2000,
          title: 'Lorem Ipsum',
          description: 'Lorem ipsum dolor sit amet',
          timestamp: Date.now(),
        },
        {
          _id: uuid(),
          type: 'out',
          amount: 500,
          title: 'Lorem Ipsum',
          description: 'Lorem ipsum dolor sit amet',
          timestamp: Date.now(),
        },
        {
          _id: uuid(),
          type: 'in',
          amount: 500,
          title: 'Lorem Ipsum',
          description: 'Lorem ipsum dolor sit amet',
          timestamp: Date.now(),
        },
        {
          _id: uuid(),
          type: 'out',
          amount: 500,
          title: 'Lorem Ipsum',
          description: 'Lorem ipsum dolor sit amet',
          timestamp: Date.now(),
        },
        {
          _id: uuid(),
          type: 'in',
          amount: 500,
          title: 'Lorem Ipsum',
          description: 'Lorem ipsum dolor sit amet',
          timestamp: Date.now(),
        },
        {
          _id: uuid(),
          type: 'out',
          amount: 500,
          title: 'Lorem Ipsum',
          description: 'Lorem ipsum dolor sit amet',
          timestamp: Date.now(),
        },
        {
          _id: uuid(),
          type: 'in',
          amount: 500,
          title: 'Lorem Ipsum',
          description: 'Lorem ipsum dolor sit amet',
          timestamp: Date.now(),
        },
        {
          _id: uuid(),
          type: 'out',
          amount: 500,
          title: 'Lorem Ipsum',
          description: 'Lorem ipsum dolor sit amet',
          timestamp: Date.now(),
        },
        {
          _id: uuid(),
          type: 'in',
          amount: 500,
          title: 'Lorem Ipsum',
          description: 'Lorem ipsum dolor sit amet',
          timestamp: Date.now(),
        },
        {
          _id: uuid(),
          type: 'out',
          amount: 500,
          title: 'Lorem Ipsum',
          description: 'Lorem ipsum dolor sit amet',
          timestamp: Date.now(),
        },
      ]
    }, (err, newCard) => {
      res.json(newCard);
    })
  });

  app.delete('/cards/:cardId', authGuard, (req, res) => {
    const _id = req.params.cardId;
    cardStore.remove({ _id }, (err, doc) => {
      res.json(!err);
    });
  })

  app.get('/cards/:cardId/movements', authGuard, (req, res) => {
    const limit = req.query.limit ? +req.query.limit : 0;
    const offset = req.query.offset ? +req.query.offset : 0;

    const _id = req.params.cardId;

    cardStore.findOne({ _id }, (err, doc) => {
      const movements = doc?.movements;
      res.json({
        total: movements?.length,
        data: movements?.slice(offset, offset + limit).map((mov: any) => ({ ...mov, cardId: req.params.cardId }))
      })
    });
  })

  app.get('/contacts', authGuard, (req, res) => {
    const userId = req.user?._id || '1';

    contactStore.find({ userId } as Partial<Contact>, (err, contacts) => {
      res.json(contacts);
    });
  });

  app.post('/contacts', authGuard, (req, res) => {
    contactStore.insert({ ...req.body, userId: req.user?._id }, (err, contact) => {
      res.json(contact);
    });
  });

  app.put('/contacts/:contactId', authGuard, (req, res) => {    
    contactStore.update({ _id: req.params.contactId }, { $set: req.body }, { multi: true }, (err, contact) => {
      res.json(contact);
    })
  });

  app.delete('/contacts/:contactId', authGuard, (req, res) => {
    const _id = req.params.contactId;
    contactStore.remove({ _id }, (err, doc) => {
      res.json(!err);
    });
  });

  app.post('/transfer', authGuard, (req, res) => {
    const transfer = req.body;
    const movement = {
      _id: uuid(),
      type: 'out',
      amount: transfer.amount,
      title: 'Transfer to ' + transfer.name + ' ' + transfer.surname + ' [' + transfer.iban + ']',
      description: 'This is the result of a Transfer operation to ' + transfer.name + ' ' + transfer.surname,
      timestamp: Date.now(),
    }

    const cardId = req.body.cardId;

    // Find card
    cardStore.findOne({ _id: cardId }, (err, doc) => {
      const movements = doc?.movements;
      console.log(cardId);
      // Add movement
      cardStore.update({ _id: cardId }, { $set: { movements: [...movements, movement], amount: doc.amount - movement.amount } }, { multi: true }, (err, doc) => {
        res.json(!err);
      });
    });
  });

  app.post('/taxes', authGuard, (req, res) => {
    res.json(true);
  });

  app.get('/locations', authGuard, (req, res) => {
    res.json([
      {
        _id: '1',
        name: 'Sede 1',
        address: 'Via dei Tali 1, Roma',
        coords: [43, 13],
        email: 'test1@test1.com',
        phone: '000 0000000'
      },
      {
        _id: '2',
        name: 'Sede 2',
        address: 'Via dei Tali 2, Roma',
        coords: [43, 43],
        email: 'test1@test1.com',
        phone: '111 1111111'
      }
    ])
  });

  app.get('/locations/:cardId', authGuard, (req, res) => {
    const cardId = req.params.cardId;
    res.json([
      {
        _id: '1',
        name: `[${cardId}] Sede 1`,
        address: 'Via dei Tali 1, Roma',
        coords: [43, 13],
        email: 'test1@test1.com',
        phone: '000 0000000'
      },
      {
        _id: '2',
        name: `[${cardId}] Sede 2`,
        address: 'Via dei Tali 2, Roma',
        coords: [43, 43],
        email: 'test1@test1.com',
        phone: '111 1111111'
      }
    ])
  });

  app.get('/slots/:locationId', authGuard, (req, res) => {
    res.json([
      {
        day: '10/22/2021',
        slots: [14, 15]
      },
      {
        day: '10/23/2021',
        slots: [10, 12, 13]
      },
      {
        day: '10/24/2021',
        slots: [9, 17]
      },
      {
        day: '10/25/2021',
        slots: [11, 14, 15, 16]
      }
    ]);
  });

  app.post('/schedule', authGuard, (req, res) => {
    res.json(true);
  })
}
