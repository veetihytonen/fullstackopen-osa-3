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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.log(error)
  if (error.name === 'CastError') {
    response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    response.status(400).json({ error: error.message })
  }

  next(error)
}   

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

app.post('/api/persons', (request, response, next) => {
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
  .catch(error => next(error))
  
  response.status(201).json(newPerson)
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const contact = Contact.findById(id)
  .then(foundContact => {
    if (!foundContact){
      response.status(404).end()
      return
    }

    response.json(foundContact)
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Contact.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
  .then(updatedContact => {
    response.json(updatedContact)
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Contact.findByIdAndDelete(id)
  .then(result => {
    response.status().end()
  })
  .catch(error => {
    next(error)
  })
  response.status(204).end()
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
