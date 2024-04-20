require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Person = require('./models/persons');

app.use(express.static('dist'));
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());

// const unknownEndpoint = (req, res) => {
//   res.status(404).send({ error: 'unknown endpoint' });
// }
// app.use(unknownEndpoint);

/** Error Handling Middleware */
const errorHandler = (error, req, res, next) => {
  console.error(error.message);
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  next(error);
}
app.use(errorHandler);

/** API root */
app.get('/', (req, res) => {
  res.send('Routes: /api/persons, /api/persons/:id, /info');
});

/** GET all persons */
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
  morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
  });
});

/** GET a single person */
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
  morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
  });
});

/** DELETE a single person */
app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error));
  morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
  });
});

/** POST a new person */
app.post('/api/persons', (req, res, next) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    });
  }
  const person = new Person({
    name: body.name,
    number: body.number
  });
  person.save()
    .then((savedPerson) => {
      if (savedPerson) {
        res.json(savedPerson);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
  morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
  });
});

/** UPDATE a single person */
app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  const body = req.body;
  const person = {
    name: body.name,
    number: body.number
  };
  Person.findByIdAndUpdate(
    id, 
    person, 
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch(error => next(error));
  morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
  });
});

/** GET info */
app.get('/info', (req, res, next) => {
  Person.find({})
    .then((result) => {
      if (result) {
        const date = new Date();
        res.send(`
          <p>Phonebook has info for ${result.length} people</p>
          <p>${date}</p>
        `);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
  morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
  });
});

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});