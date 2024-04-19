require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Person = require('./models/persons');

app.use(express.json());
app.use(morgan('tiny'));
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());
app.use(express.static('dist'));

// let persons = [
//   { 
//     "id": 1,
//     "name": "Arto Hellas", 
//     "number": "040-123456"
//   },
//   { 
//     "id": 2,
//     "name": "Ada Lovelace", 
//     "number": "39-44-5323523"
//   },
//   { 
//     "id": 3,
//     "name": "Dan Abramov", 
//     "number": "12-43-234345"
//   },
//   { 
//     "id": 4,
//     "name": "Mary Poppendieck", 
//     "number": "39-23-6423122"
//   }
// ];


app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/persons', (req, res) => {
  // res.json(persons);
  Person.find({}).then((result) => {
    res.json(result);
  });
  morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
  });
});

app.get('/api/persons/:id', (req, res) => {
  // const id = Number(req.params.id);
  // const person = persons.find(person => person.id === id);
  // if (person) {
  //   res.json(person);
  // } else {
  //   res.status(404).end();
  // }
  const id = req.params.id;
  Person.findById(id).then((person) => {
    res.json(person);
  });
  morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
  });
});

// app.delete('/api/persons/:id', (req, res) => {
//   const id = Number(req.params.id);
//   persons = persons.filter(person => person.id !== id);
//   res.status(204).end();
//   morgan.token('body', (req, res) => {
//     return JSON.stringify(req.body);
//   });
// });

app.post('/api/persons', (req, res) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    });
  }
  // if (persons.find(person => person.name === body.name)) {
  //   return res.status(400).json({
  //     error: 'name must be unique'
  //   });
  // }
  // const person = {
  //   name: body.name,
  //   number: body.number
  // };
  // const newRandomId = () => {
  //   let randomId = Math.floor(Math.random() * 1024);
  //   if (persons.find(person => person.id === randomId)) {
  //     return newRandomId();
  //   }
  //   return randomId;
  // };
  // person.id = newRandomId();
  // persons = persons.concat(person);
  // res.json(person);
  const person = new Person({
    name: body.name,
    number: body.number
  });
  person.save().then((savedPerson) => {
    res.json(savedPerson);
  });
  morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
  });
});

// app.get('/info', (req, res) => {
//   const date = new Date();
//   res.send(`
//     <p>Phonebook has info for ${persons.length} people</p>
//     <p>${date}</p>
//   `);
//   morgan.token('body', (req, res) => {
//     return JSON.stringify(req.body);
//   });
// });

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});