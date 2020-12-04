const mongoose = require('mongoose');

mongoose.connect(
  process.env.MONGO_URL,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err) => {
    if (err) throw err;
    console.log('Successfully connected to database');
  },
);

module.exports = mongoose;
