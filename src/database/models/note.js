const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
  userId: Number,
  message: String,
  time: String,
  number: Number,
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
