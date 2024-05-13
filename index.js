require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const Contact = require('./models/contanct')

morgan.token('body', (req) => {
  const {id: _, ...noID} = req.body
  const body = JSON.stringify(noID)
  return body === "{}" ? "" : body
})

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/info', (request, response) => {
  response.send(`
    <div>
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}<p/>
    </div>
  `)
})

app.get('/api/persons', (request, response) => {
  Contact.find({})
  .then(contacts => {
    response.json(contacts)
  })
  .catch(error => {
    console.log('error fetching contacts from db', error.message)
  })
})

app.post('/api/persons', (request, response) => {
  const newPerson = request.body
  
  if (!newPerson.name || !newPerson.number) {
    response.status(400).json({error: 'name or number missing'})
    return 
  }

  const contact = new Contact({
    name: newPerson.name,
    number: newPerson.number
  })

  contact.save()
  .then(result => {
    console.log(`added ${newPerson.name} number ${newPerson.number} to phonebook`)
  })
  
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

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})