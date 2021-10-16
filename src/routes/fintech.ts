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

    const { name, surname, type, number, csc } = req.body;
    
    if (!name || !surname || !type || !number || !csc) {
      return res.status(400).json({
        error: 'Body must include name, surname, type, number and csc.'
      })
    }

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

    if (!_id) {
      return res.status(400).json({
        error: 'URL must include the card ID, eg: /cards/g4159g5'
      })
    }  

    cardStore.remove({ _id }, (err, doc) => {
      res.json(!err);
    });
  })

  app.get('/cards/:cardId/movements', authGuard, (req, res) => {
    const _id = req.params.cardId;
    
    if (!_id) {
      return res.status(400).json({
        error: 'URL must include the card ID, eg: /cards/g4159g5/movements'
      })
    }  

    const limit = req.query.limit ? +req.query.limit : 0;
    const offset = req.query.offset ? +req.query.offset : 0;


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
    const { name, surname, iban } = req.body;
    if (!name || !surname || !iban) {
      return res.status(400).json({
        error: 'Body must include name, surname and iban.'
      })
    }

    const userId = req.user?._id || '1';

    contactStore.insert({ ...req.body, userId }, (err, contact) => {
      res.json(contact);
    });
  });

  app.put('/contacts/:contactId', authGuard, (req, res) => {  
    const _id = req.params.contactId;
    if (!_id) {
      return res.status(400).json({
        error: 'URL must include the contact ID, eg: /contact/g4159g5'
      })
    }  
    contactStore.update({ _id }, { $set: req.body }, { multi: true }, (err, contact) => {
      res.json(contact);
    })
  });

  app.delete('/contacts/:contactId', authGuard, (req, res) => {
    const _id = req.params.contactId;
    if (!_id) {
      return res.status(400).json({
        error: 'URL must include the contact ID, eg: /contact/g4159g5'
      })
    }
    contactStore.remove({ _id }, (err, doc) => {
      res.json(!err);
    });
  });

  app.post('/transfer', authGuard, (req, res) => {
    const { amount, name, surname, iban } = req.body;
    if (!amount || !name || !surname || !iban) {
      return res.status(400).json({
        error: 'Body must include amount, name, surname and iban.'
      })
    }
    const movement = {
      _id: uuid(),
      type: 'out',
      amount: amount,
      title: 'Transfer to ' + name + ' ' + surname + ' [' + iban + ']',
      description: 'This is the result of a Transfer operation to ' + name + ' ' + surname,
      timestamp: Date.now(),
    }

    const cardId = req.body.cardId;

    // Find card
    cardStore.findOne({ _id: cardId }, (err, doc) => {
      const movements = doc?.movements;
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
    if (!cardId) {
      return res.status(400).json({
        error: 'URL must include the cardId, eg: /locations/g45t651'
      })
    }
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
    if (!req.body.day || !req.body.slot) {
      return res.status(400).json({
        error: 'Body must include "day" and "slot".'
      })
    }
    res.json(true);
  })
}
