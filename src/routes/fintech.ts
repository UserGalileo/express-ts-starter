import { Application } from 'express';
import { PassportStatic } from 'passport';
import { authGuard } from '../guards/auth.guard';
import { cardStore, contactStore } from '../store';
import { v4 as uuid } from 'uuid';
import { Contact } from '../models/contact';

export function setupRoutes(app: Application, passport: PassportStatic) {

  app.get('/example-cards', (req, res) => {
    res.json([
      {
        _id: uuid(),
        number: '0000 0000 0000 0000',
        ownerId: 'et45er5e6fba',
        owner: 'Mario Rossi',
        type: 'visa',
        amount: 15000,
      },
      {
        _id: uuid(),
        number: '1111 1111 1111 1111',
        ownerId: 'et45er5e6fba',
        owner: 'Mario Rossi',
        type: 'mastercard',
        amount: 500,
      },
      {
        _id: uuid(),
        number: '2222 2222 2222 2222',
        ownerId: 'et45er5e6fba',
        owner: 'Mario Rossi',
        type: 'visa',
        amount: 250000,
      }
    ])
  });

  app.get('/cards', authGuard, (req, res) => {
    cardStore.find({}, (err, cards) => {
      res.json(cards);
    })
  });

  app.post('/cards', authGuard, (req, res) => {

    const { name, surname, type, number, csc } = req.body;
    
    if (!name || !surname || !type || !number || !csc) {
      return res.status(400).json({
        error: 'La richiesta deve includere i campi: name, surname, type, number, csc.'
      })
    }

    const movements = [
      {
        _id: uuid(),
        type: 'in',
        amount: 645,
        title: 'YouTube - Pagamento mensile',
        description: 'Questo mese hai accumulato 752.340 views sul tuo canale!',
        timestamp: Date.now(),
      },
      {
        _id: uuid(),
        type: 'in',
        amount: 1980,
        title: 'Stipendio',
        description: 'La tua busta paga per questo mese.',
        timestamp: Date.now(),
      },
      {
        _id: uuid(),
        type: 'out',
        amount: 410,
        title: 'Amazon - Pagamento ordine #1234',
        description: 'Descrizione articolo: "Ciabatte comodissime".',
        timestamp: Date.now(),
      },
      {
        _id: uuid(),
        type: 'in',
        amount: 100,
        title: 'Regalo di compleanno',
        description: 'Tanti auguri da zia Francesca!!',
        timestamp: Date.now(),
      },
      {
        _id: uuid(),
        type: 'out',
        amount: 500,
        title: 'Pernottamento in Hotel',
        description: 'Hai pernottato 4 giorni all\'Hotel 4 stelle "La Fiorentina", Firenze.',
        timestamp: Date.now(),
      },
      {
        _id: uuid(),
        type: 'in',
        amount: 150,
        title: 'Regalo di compleanno',
        description: 'Buon compleanno!',
        timestamp: Date.now(),
      },
      {
        _id: uuid(),
        type: 'out',
        amount: 390,
        title: 'Bolletta mensile - luce e gas',
        description: 'Questo mese hai speso 280€ di gas e 110€ di luce.',
        timestamp: Date.now(),
      },
      {
        _id: uuid(),
        type: 'in',
        amount: 500,
        title: 'Quattordicesima',
        description: 'Quattordicesima 2021.',
        timestamp: Date.now(),
      },
      {
        _id: uuid(),
        type: 'out',
        amount: 495,
        title: 'Abbonamento annuale calcio e sport',
        description: 'Essendo nostro cliente da 14 anni, le abbiamo riservato 5€ di sconto.',
        timestamp: Date.now(),
      },
      {
        _id: uuid(),
        type: 'in',
        amount: 500,
        title: 'Regalo di compleanno',
        description: 'Tanti auguri dal parente sicuramente più simpatico!',
        timestamp: Date.now(),
      },
      {
        _id: uuid(),
        type: 'out',
        amount: 500,
        title: 'Cena - Villa Crespi, degustazione',
        description: 'La aspettiamo con ansia anche l\'anno prossimo.',
        timestamp: Date.now(),
      }
    ];

    cardStore.insert({
      ...req.body,
      owner: req.user?.displayName || 'Mario Rossi',
      ownerId: req.user?._id || '1',
      amount: movements.reduce((acc, curr) => {
        if (curr.type === 'in') return acc + curr.amount;
        return acc - curr.amount;
      }, 0),
      movements
    }, (err, newCard) => {
      res.json(newCard);
    })
  });

  app.delete('/cards/:cardId', authGuard, (req, res) => {
    const _id = req.params.cardId;

    if (!_id) {
      return res.status(400).json({
        error: 'L\'URL deve includere l\'id della carta, esempio: /cards/g4159g5'
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
        error: 'L\'URL deve includere l\'id della carta, esempio: /cards/g4159g5/movements'
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
        error: 'La richiesta deve includere i campi: name, surname, iban.'
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
        error: 'L\'URL deve includere l\'id del contatto, esempio: /contact/g4159g5'
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
        error: 'L\'URL deve includere l\'id della carta, esempio: /contact/g4159g5'
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
        error: 'La richiesta deve includere i campi: amount, name, surname, iban.'
      })
    }
    const movement = {
      _id: uuid(),
      type: 'out',
      amount: amount,
      title: 'Trasferimento a ' + name + ' ' + surname + ' [' + iban + ']',
      description: 'Questo è il risultato di una operazione di trasferimento a ' + name + ' ' + surname,
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
        coords: [41.9027835, 12.4963655],
        email: 'test1@test1.com',
        phone: '000 0000000'
      },
      {
        _id: '2',
        name: 'Sede 2',
        address: 'Via dei Tali 2, Roma',
        coords: [41.9027935, 12.4163155],
        email: 'test2@test2.com',
        phone: '111 1111111'
      },
      {
        _id: '3',
        name: 'Sede 3',
        address: 'Via dei Tali 3, Firenze',
        coords: [43.769560, 11.255814],
        email: 'test3@test3.com',
        phone: '222 2222222'
      },
      {
        _id: '4',
        name: 'Sede 4',
        address: 'Via dei Tali 4, Bassano del Grappa',
        coords: [45.765729, 11.727275],
        email: 'test4@test4.com',
        phone: '333 3333333'
      },
      {
        _id: '5',
        name: 'Sede 5',
        address: 'Via dei Tali 5, Cagliari',
        coords: [39.223841, 9.121661],
        email: 'test5@test5.com',
        phone: '444 4444444'
      },
    ])
  });

  app.get('/locations/:cardId', authGuard, (req, res) => {
    const cardId = req.params.cardId;
    if (!cardId) {
      return res.status(400).json({
        error: 'L\'URL deve includere l\'id della carta, esempio: /locations/g45t651'
      })
    }
    res.json([
      {
        _id: '2',
        name: 'Sede 2',
        address: 'Via dei Tali 2, Roma',
        coords: [43, 43],
        email: 'test2@test2.com',
        phone: '111 1111111'
      },
      {
        _id: '3',
        name: 'Sede 3',
        address: 'Via dei Tali 3, Firenze',
        coords: [53, 13],
        email: 'test3@test3.com',
        phone: '222 2222222'
      },
    ])
  });

  app.get('/slots/:locationId', authGuard, (req, res) => {

    /**
     * Helpers, they're here for convenience
     */
    function addDays(date: Date, days: number) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    function randomDate(from: Date, to: Date) {
      const fromTime = from.getTime();
      const toTime = to.getTime();
      return new Date(fromTime + Math.random() * (toTime - fromTime));
    }

    function randomNumber(min: number, max: number) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function distinct(value: any, index: number, self: any[]) {
      return self.indexOf(value) === index;
    }

    function distinctByKey(key: any) {
      return (value: any, index: number, self: any[]) => {
        const foundIndex = self.findIndex(x => x[key] === value[key]);
        return foundIndex === index;
      }
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = addDays(startDate, 30);

    const daysWithSlots = new Array(20).fill(null)
      .map(() => randomDate(startDate, endDate))
      .map((date, index) => {

        const slotsNr = index % 2 === 0 ? 3 : 5;

        let slots = new Array(slotsNr)
          .fill(null)
          .map(() => randomNumber(9, 18))
          .filter(distinct);

        slots.sort((a, b) => a - b);

        return {
          day: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
          slots
        }
      })
      .filter(distinctByKey('day'));

    res.json(daysWithSlots);
  });

  app.post('/schedule', authGuard, (req, res) => {
    if (!req.body.day || !req.body.slot) {
      return res.status(400).json({
        error: 'La richiesta deve includere i campi "day" e "slot".'
      })
    }
    res.json(true);
  })
}
