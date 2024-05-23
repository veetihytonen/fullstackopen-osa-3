const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const numberValidator = (input) => {
  const formatted = input.split('-')
  if (formatted.length !== 2)
    return false

  const [ beg, end ] = formatted

  if (beg.length < 2 || beg.length > 3)
    return false
  if (beg.length + end.length < 8)
    return false

  return true
}

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    validate: [numberValidator, props => `${props.value} is not a valid number`],
    required: true
  }
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', contactSchema)
