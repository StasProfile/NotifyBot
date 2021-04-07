require('dotenv').config();
require('./database');
const mongoose = require('mongoose');

const express = require('express');
const { DateTime } = require('luxon');
const bot = require('./bot.js');

const app = express();
const port = 3000;
const Note = require('./database/models/note');

app.use(express.json());
app.use(express.static('public'));

app.get('/notifications/:userId', async (req, res) => {
  const notes = await Note.find({ userId: req.params.userId }).sort('date');
  res.json(notes);
});

app.post('/notifications/:userId', async (req, res) => {
  const { date, message } = req.body;

  const dt = DateTime.fromFormat(date, 'HH:mm dd/MM');

  await Note.create({
    userId: req.params.userId,
    message,
    date: dt.setZone('Europe/Moscow', {
      keepLocalTime: true,
    }).toJSDate(),
  });

  await bot.sendMessage(req.params.userId, `Уведомление создано! Я обязательно напомню ${message} в ${dt.toFormat('HH:mm dd/MM')}`)
    .catch((err) => console.log(err));

  res.json({ message: 'notification successfuly created' });
});

app.delete('/notifications/:userId/:notificationId', async (req, res) => {
  const note = await Note.findOne({ _id: req.params.notificationId });
  if (!note) {
    return res.json({message: 'note not found'});
  }
  const dt = await DateTime.fromJSDate(new Date(note.date)).toFormat('HH:mm dd/MM');
  await Note.deleteOne({ _id: req.params.notificationId, userId: req.params.userId });
  await bot.sendMessage(req.params.userId, `Уведомление ${note.message} в ${dt} успешно удалено /list чтобы посмотреть список ваших уведомлений`)
    .catch((err) => console.log(err));

  res.json({ message: 'notification successfully deleted' });
});

app.delete('/notifications/:userId/all', async (req, res) => {
  await Note.deleteMany({ userId: req.params.userId });
  res.json({ message: 'all notifications successfuly deleted' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

app.listen(process.env.PORT || port, () => {
  console.log('Server started');
});