const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
  userId: Number,
  message: String,
  date: Date,
  // number: Number,
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
