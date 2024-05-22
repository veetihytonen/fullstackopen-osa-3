const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://veetihytonen:${password}@cluster0.0gytjw4.mongodb.net/phonebook?
retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Contact = mongoose.model('Contact', contactSchema)

const getAllContacts = () => {
  Contact.find({})
    .then(result => {
      console.log('phonebook:')
      result.forEach(contact => {
        console.log(`${contact.name} ${contact.number}`)
      })
      mongoose.connection.close()
    })
}

const createContact = (name, number) => {
  const contact = new Contact({
    name: name,
    number: number
  })

  contact.save()
    .then(result => {
      console.log(`added ${name} number ${number} to phonebook`)
      mongoose.connection.close()
    })
}

if (process.argv.length === 3) {
  getAllContacts()
} else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]
  createContact(name, number)
} else {
  console.log('incorrect number of arguments')
  mongoose.connection.close()
}
