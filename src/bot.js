const cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');
const { DateTime } = require('luxon');
const User = require('./database/models/user');
const Note = require('./database/models/note');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

cron.schedule('* * * * *', async () => {
  const notes = await Note.find({ date: { $lte: Date.now() } });

  for (const note of notes) {
    const minute = 60000;

    if (Date.now() - note.date < minute) {
      bot.sendMessage(note.userId, `Напоминаю ${note.message} сейчас`);
    } else if (note.date - Date.now() > minute * 20) {
      bot.sendMessage(note.userId, `Не удалось отправить уведомление ${note.message}`);
    }
    // eslint-disable-next-line no-await-in-loop
    await Note.deleteOne({ _id: note._id });
  }
});

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

  const newUser = await User.create({
    telegramId: msg.from.id,
    username: `${msg.from.first_name} ${msg.from.last_name}`,
  });

  await bot.sendMessage(msg.from.id, `Я тебя добавил\nТвоя персональная ссылка для управления уведомлениями из браузера:\n${process.env.APP_URL}?userId=${newUser.telegramId}`)
    .catch((err) => console.log(err));
});

bot.onText(/\/link/, async (msg) => {
  const user = await User.findOne({ telegramId: msg.from.id })
  await bot.sendMessage(msg.from.id, `Держи твою персональную ссылку для управления уведомлениями из браузера:\n${process.env.APP_URL}?uniqueId=${user._id}`)
    .catch((err) => console.log(err));
});

bot.onText(/\/help/, async (msg) => {
  const userId = msg.from.id;
  await bot.sendMessage(userId, 'Cоздать уведомление:\n/new {название уведомления} в {время в формате hh:mm} {дата в формате dd/mm} Дату указывать не обязательно, дата по умолчанию - день создания уведомления.\nПосмотреть текущий список уведомлений:\n/list\nУдалить уведомление по нормеру:\n/delete {номер уведомления из списка уведомлений}\nУдалить все ваши уведомления:\n/delete all\n/link\nПолучить персональную ссылку для управления уведомлениями из браузера')
    .catch((err) => console.log(err));
});

bot.onText(/\/new (.+) в (.+)/, async (msg, match) => {
  const userId = msg.from.id;
  const message = match[1];
  const dateTime = match[2];
  // const year = 2021;
  let dt = DateTime.fromFormat(dateTime, 'HH:mm dd/MM');
  const dtDefault = DateTime.fromFormat(dateTime, 'HH:mm');
  if (!dt.isValid) {
    dt = dtDefault;
    if (!dtDefault.isValid) {
      return bot.sendMessage(userId, 'Введите время и дату в формате hh:mm dd/mm или в формате hh:mm');
    }
  }

  //comment dat
  const dateNow = Date.now();
  console.log(dt);
  const day = 5184000000;

  // if (dateNow > dt.ts) {
  //   dt.c.day += 1;
  //   dt.ts += day;
  // }
  //comment dat
  const hourNow = new Date(Date.now()).getUTCHours();
  if ((hourNow >= 21 && hourNow <= 23) || hourNow === 0) {
    dt.c.day += 1;
    dt.ts += day;
  }

  let user = await User.findOne({ telegramId: msg.from.id })
    .catch((e) => {
      console.log(`Ошибка при создании уведомления(User.findOne)\n${e}`);
      throw e;
    });

  if (!user) {
    user = await User.create({
      telegramId: msg.from.id,
      username: `${msg.from.first_name} ${msg.from.last_name}`,
    });
  }

  await Note.create({
    userId: msg.from.id,
    message,
    date: dt.setZone('Europe/Moscow', {
      keepLocalTime: true,
    }).toJSDate(),
  });

  await bot.sendMessage(userId, `Уведомление создано! Я обязательно напомню ${message} в ${dt.toFormat('HH:mm dd/MM')}`)
    .catch((err) => console.log(err));
});

bot.onText(/\/list/, async (msg) => {
  const notes = await Note.find({ userId: msg.from.id }).sort('date');
  if (!notes.length) {
    await bot.sendMessage(msg.from.id, 'Список уведомление пуст')
      .catch((err) => console.log(err));
    return;
  }
  const str = notes.map((note, index) => `${index + 1}) ${note.message} ${DateTime.fromJSDate(note.date).setZone('Europe/Moscow').toFormat('HH:mm dd/MM')}`).join('\n');
  await bot.sendMessage(msg.from.id, str)
    .catch((err) => console.log(err));
});

bot.onText(/\/delete (.+)/, async (msg, match) => {
  const notes = await Note.find({ userId: msg.from.id }).sort('date');

  if (!notes.length) {
    await bot.sendMessage(msg.from.id, 'Нечего удалять, список ваших уведомлений пуст')
      .catch((err) => console.log(err));
    return;
  }

  if (match[1] === 'all') {
    await Note.deleteMany({ userId: msg.from.id });
    await bot.sendMessage(msg.from.id, 'Уведомления успешно удалены, список ваших уведомлений пуст')
      .catch((err) => console.log(err));
    return;
  }

  const index = Number(match[1]);
  if (index % 1 !== 0 || index === 0 || index <= 0) {
    await bot.sendMessage(msg.from.id, 'Введите номер уведомления которое хотите удалить, либо ключевое слово all чтобы удалить все уведомления')
      .catch((err) => console.log(err));
    return;
  }

  if (notes.length < index) {
    await bot.sendMessage(msg.from.id, 'Не существует уведомления с таким номером, используйте команду /list чтобы посмотреть список ваших уведомлений')
      .catch((err) => console.log(err));
    return;
  }
  console.log(notes[index - 1].message);
  await Note.deleteOne({ _id: notes[index - 1]._id, userId: msg.from.id });
  await bot.sendMessage(msg.from.id, 'Уведомление успешно удалено /list чтобы посмотреть список ваших уведомлений')
    .catch((err) => console.log(err));
});

module.exports = bot;