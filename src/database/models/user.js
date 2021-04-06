const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  telegramId: {
    type: Number,
    unique: true,
    require: true,
  },
  username: String,
  // notes: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Note',
  // }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
