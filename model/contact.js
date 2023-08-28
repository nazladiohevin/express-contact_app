const { mongoose, Types } = require('mongoose');

const ObjectId = Types.ObjectId;

const Contact = mongoose.model('Contact', {
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  nohp: {
    type: String,
    required: true
  }
});

module.exports = { Contact, ObjectId };