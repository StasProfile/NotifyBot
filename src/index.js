require('dotenv').config();
require('./database');

const express = require('express');
const { DateTime } = require('luxon');
const bot = require('./bot.js');

const app = express();
const port = 3000;
const Note = require('./database/models/note');

app.use(express.json());
app.use(express.static('public'));

app.get('/notifications/:userId', async (req, res) => {
  const notes = await Note.find({ userId: req.params.userId });
  res.json(notes);
});

app.post('/notifications/:userId', async (req, res) => {
  const { date, message } = req.body;

  let dt = DateTime.fromFormat(date, 'HH:mm dd/MM');
  const dtDefault = DateTime.fromFormat(date, 'HH:mm');
  if (!dt.isValid) {
    dt = dtDefault;
  }

  await Note.create({
    userId: req.params.userId,
    message,
    date: dt,
  });

  await bot.sendMessage(req.params.userId, `Уведомление создано! Я обязательно напомню ${message} в ${dt.toFormat('HH:mm dd/MM')}`)
    .catch((err) => console.log(err));

  res.json({ message: 'notification successfuly created' });
});

app.delete('/notifications/:userId/:notificationId', async (req, res) => {
  await Note.deleteOne({ _id: req.params.notificarionId, userId: req.params.userId });
  res.json({ message: 'notification successfully deleted' });
});

app.delete('/notifications/:userId/all', async (req, res) => {
  await Note.deleteMany({ userId: req.params.userId });
  res.json({ message: 'all notifications successfuly deleted' });
});

app.listen(process.env.PORT || port, () => {
  console.log('Server started');
});
