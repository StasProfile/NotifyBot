const schedule = require('node-schedule');
const TelegramBot = require('node-telegram-bot-api');
const User = require('./database/models/user');
const Note = require('./database/models/note');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// const users = {};

function createNotification(note) {
  const notification = schedule.scheduleJob(note.date, async () => {
    await bot.sendMessage(note.userId, `Напоминаю, что вы должны: ${note.message} сейчас.`)
      .catch((err) => console.log(err));
    await Note.deleteOne({
      _id: note.id,
    });
    notification.cancel();
  });
}

bot.onText(/\/start/, async (msg) => {
  const user = await User.findOne({ telegramId: msg.from.id })
    .catch((e) => {
      console.log(`Ошибка при создании юзера\n${e}`);
      throw e;
    });
  if (user) {
    await bot.sendMessage(msg.from.id, 'Ты уже добавлен')
      .catch((err) => console.log(err));
    return;
  }
  await User.create({
    telegramId: msg.from.id,
    username: `${msg.from.first_name} ${msg.from.last_name}`,
  });
  await bot.sendMessage(msg.from.id, 'Я тебя добавил')
    .catch((err) => console.log(err));
});

bot.onText(/\/help/, async (msg) => {
  const userId = msg.from.id;
  await bot.sendMessage(userId, 'Cоздать уведомление:\n/new {название уведомления} {время в формате hh:mm}\nПосмотреть текущий список уведомлений:\n/list\nУдалить уведомление по нормеру:\n/delete {номер уведомления из списка уведомлений или all(удалить все уведомления)}')
    .catch((err) => console.log(err));
});

bot.onText(/\/new (.+) в (^(([0-1][0-9])|(2[0-3])):([0-5][0-9])$)/, async (msg, match) => {
  const userId = msg.from.id;
  const message = match[1];
  const time = match[2];

  const user = await User.findOne({ telegramId: msg.from.id })
    .catch((e) => {
      console.log(`Ошибка при создании уведомления(User.findOne)\n${e}`);
      throw e;
    });

  if (!user) {
    await User.create({
      telegramId: msg.from.id,
      username: `${msg.from.first_name} ${msg.from.last_name}`,
    });
  }

  const note = await Note.create({
    userId: msg.from.id,
    message,
    time,
  });

  await bot.sendMessage(userId, `Отлично! Я обязательно напомню ${message} в ${time}`)
    .catch((err) => console.log(err));

  const [hours, minutes] = match[2].split(':');
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours - 3, minutes, 0);
  console.log('now = ', now);
  console.log('date = ', date);
  createNotification({
    id: note._id,
    message: note.message,
    userId: note.userId,
    date,
  });
  // const notification = schedule.scheduleJob(date, async () => {
  //   await bot.sendMessage(userId, `Напоминаю, что вы должны: ${message} сейчас.`)
  //     .catch((err) => console.log(err));
  //   await note.delete();
  //   notification.cancel();
  // });
});

bot.onText(/\/list/, async (msg) => {
  if (!Note.findOne({ telegramId: msg.from.id })) {
    await bot.sendMessage(msg.from.id, 'Список уведомление пуст')
      .catch((err) => console.log(err));
    return;
  }
  const str = await Note.find({ telegramId: msg.from.id }).map((note, index) => `${index + 1}) ${note.message} ${note.time}`).join('\n');
  await bot.sendMessage(msg.from.id, str)
    .catch((err) => console.log(err));
});

bot.onText(/\/delete (.+)/, async (msg, match) => {
  if (!Note.findOne({ telegramId: msg.from.id })) {
    await bot.sendMessage(msg.from.id, 'Нечего удалять')
      .catch((err) => console.log(err));
    return;
  }
  if (match[1] === 'all') {
    await Note.delete({
      userId: msg.from.id,
    });
    await bot.sendMessage(msg.from.id, 'все уведомления удалены')
      .catch((err) => console.log(err));
    return;
  }
  const number = match[1] - 1;
  const str = await Note.find({ telegramId: msg.from.id }).map((note, index) => `${index + 1}) ${note.message} ${note.time}`).join('\n');
  if (number > await Note.find({ telegramId: msg.from.id }).length) {
    await bot.sendMessage(msg.from.id, `не существует уведомления с таким номером\n${str}`)
      .catch((err) => console.log(err));
    return;
  }

  if (await Note.find({ telegramId: msg.from.id }).length === 1) {
    Note.deleteOne({ telegramId: msg.from.id });
    await bot.sendMessage(msg.from.id, 'уведомление удалено, список уведомлений пуст:\n')
      .catch((err) => console.log(err));
    return;
  }

  Note.deleteOne({
    telegramId: msg.from.id,

  });
  const newMessage = notes.map((note, index) => `${index + 1}) ${note.message} ${note.time}`).join('\n');
  await bot.sendMessage(userId, `уведомление удалено, новый список уведомлений:\n${newMessage}`)
    .catch((err) => console.log(err));
});

module.exports = bot;
