const { match } = require('assert');
const dotenv = require('dotenv').config();
var TelegramBot = require('node-telegram-bot-api');

    const token = process.env.BOT_TOKEN;
	const bot = new TelegramBot(token, {polling: true});

	let notes = [];
    let notifList = '';

    bot.onText(/\/help/, function (msg) {
        const userId = msg.from.id;
        bot.sendMessage(userId,'Cоздать уведомление:\n/напомни {название уведомления} {время в формате час:минута}\nПосмотреть текущий список уведомлений:\n/уведомления\nУдалить уведомление по нормеру:\n/удалить {номер уведомления из списка уведомлений}');
    });

	bot.onText(/\/напомни (.+) в (.+)/, function (msg, match) {
	  const userId = msg.from.id;
	  const text = match[1];
	  const time = match[2];

	  notes.push( { uid:userId, time:time, text:text } );
      notifList += (notes.length) + ') ' + notes[notes.length - 1].text + ' в ' + notes[notes.length - 1].time + '\n';
	  bot.sendMessage(userId,'Отлично! Я обязательно напомню, если не сдохну :)');
    });

    bot.onText(/\/уведомления/, function (msg, match) {
        if (notes.length === 0) {
            bot.sendMessage(msg.from.id,'Список уведомление пуст');
        } 
        else {
            bot.sendMessage(msg.from.id, notifList);
        }
    });
    
    bot.onText(/\/удалить (.+)/, function (msg, match) {
        const userId = msg.from.id;
         number = match[1] - 1;
         console.log(number);
        if (number > notes.length - 1){
            bot.sendMessage(userId, 'не существует уведомления с таким номером\n' + notifList);
        }
        else {
            notes.splice(number,1);
            notifList = '';
            for (let i = 0; i < notes.length; i++) { 
                notifList += (i + 1) + ') ' + notes[i].text + ' в ' + notes[i].time + '\n';
              }
            bot.sendMessage(userId, 'удалено, новый список уведомлений:\n' + notifList);
        }
    });

	setInterval(function(){
		for (var i = 0; i < notes.length; i++){
			let curDate = new Date().getHours() + ':' + new Date().getMinutes();
				if ( notes[i].time == curDate ) {
					bot.sendMessage(notes[i].uid, 'Напоминаю, что вы должны: '+ notes[i].text + ' сейчас.');
					notes.splice(i,1);
				}
			}
	},1000);