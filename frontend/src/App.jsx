import { useState, useEffect } from 'react'
import personService from './services/persons'

const Error = ({ message }) => {
  if (message === null) {
    return null
  }

  const style = {
    color: 'red',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }

  return (
    <div style={style}>
      {message}
    </div>
  )
}

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  const style = {
    color: 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }
  
  return (
    <div style={style}>
      {message}
    </div>
  )
}

const Person = ({ person, deletePerson }) => (
  <>
    <p>{person.name} {person.number} <button onClick={() => deletePerson(person.id)}>delete</button> </p>
  </>
)

const Persons = ({ persons, filter, deletePerson }) => {
  const personsToShow = persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))

  const asComponents = personsToShow.map(person => <Person person={person} key={person.name} deletePerson={deletePerson} />)

  return (
    <>
      {asComponents}
    </>
  )
}

const NewPersonForm = ({ onPersonSubmit, newName, onNameChange, newNumber, onNumberChange }) => (
  <form onSubmit={onPersonSubmit}>
    <div>
      name: <input value={newName} onChange={onNameChange}/>
    </div>
    <div>
      number: <input value={newNumber} onChange={onNumberChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Filter = ({ filter, onFilterChange }) => (
  <div>
    filter shown with <input value={filter} onChange={onFilterChange}/>
  </div>
)

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const clearForm = () => {
    setNewName('')
    setNewNumber('')
  }

  const timeNotification = (message, seconds) => {
    setNotification(message)
    setTimeout(() => {
      setNotification(null)
    }, seconds * 1000)
  }

  const timeError = (message, seconds) => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, seconds * 1000)
  }

  const deletePerson = (personId) => {
    const name = persons.find(person => person.id === personId).name
    if (! window.confirm(`Delete ${name}?`)) {
      return
    }

    personService
      .remove(personId)
      .then(removedPerson => {
        setPersons(persons.filter(person => person.id !== personId))
        timeNotification(`Removed ${name}`, 5)
      })
  }

  const onNameChange = (event) => {
    setNewName(event.target.value)
  }

  const onNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const onFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const onPersonSubmit = (event) => {
    event.preventDefault()

    if (persons.every(person => person.name !== newName)) {
      const newPerson = { 'name': newName, 'number': newNumber }

      personService
        .create(newPerson)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          timeNotification(`Added ${returnedPerson.name}`, 5)
          clearForm()
        })
        .catch(error => {
          timeError(error.response.data.error, 5)
        })

      return
    }

    if (!window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
      return
    }
    
    const updatedPerson = {...persons.find(person => person.name === newName), number: newNumber}
    
    personService
      .update(updatedPerson.id, updatedPerson)
      .then(returnedPerson => {
        setPersons(persons.map(person => person.id !== returnedPerson.id ? person : returnedPerson))
        timeNotification(`Modified number for ${returnedPerson.name}`, 5)
        clearForm()
      })
      .catch(error => {
        message = error.response.data.error
        if ("Contact validation failed" in message) {
          timeError(message, 5)
        }
        else {
          timeError(`${updatedPerson.name} was already removed from server`, 5)
        }
      })

  }
  
  return (
    <div>
      <h2>Phonebook</h2>
      <Error message={error} />
      <Notification message={notification} />
      <Filter filter={filter} onFilterChange={onFilterChange} persons={persons} setPersons={setPersons} />
      <h2>add a new</h2>
      <NewPersonForm 
        onPersonSubmit={onPersonSubmit}
        newName={newName}
        onNameChange={onNameChange}
        newNumber={newNumber}
        onNumberChange={onNumberChange}
      />
      <h2>Numbers</h2>
      <Persons persons={persons} filter={filter} deletePerson={deletePerson} />
    </div>
  )

}

export default App
