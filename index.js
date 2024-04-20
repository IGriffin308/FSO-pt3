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

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
}
app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }
  next(error);
}
app.use(errorHandler);


app.get('/', (req, res) => {
  res.send('Hello World');
});

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

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error));
  morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
  });
});

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

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  const body = req.body;
  const person = {
    name: body.name,
    number: body.number
  };
  Person.findByIdAndUpdate(id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch(error => next(error));
  morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
  });
});

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