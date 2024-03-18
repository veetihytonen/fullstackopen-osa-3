const express = require('express')
const { request, response } = require('http')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(morgan('tiny'))

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]

app.get('/info', (request, response) => {
  response.send(`
    <div>
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}<p/>
    </div>
  `)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.post('/api/persons', (request, response) => {
  const newPerson = request.body
  
  if (!newPerson.name || !newPerson.number) {
    response.status(400).json({error: 'name or number missing'})
    return 
  }
  if (persons.find(person => person.name === newPerson.name)) {
    response.status(400).json({error: 'name must be unique'})
    return
  } 

  newPerson.id = Math.floor(Math.random() * 1000)

  persons.push(newPerson)
  
  response.status(201).json(newPerson)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const resPerson = persons.find(person => person.id === id)

  if (!resPerson) {
    response.status(404).end()
  }

  response.json(resPerson)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})