const { match } = require('assert');
const dotenv = require('dotenv').config();
const schedule = require('node-schedule');
var TelegramBot = require('node-telegram-bot-api');

    const token = process.env.BOT_TOKEN;
	const bot = new TelegramBot(token, {polling: true});

	// let notes = [];
    const users = {};

    bot.onText(/\/help/, function (msg) {
        const userId = msg.from.id;
        bot.sendMessage(userId,'Cоздать уведомление:\n/напомни <название уведомления> в <время в формате hh:mm>\nПосмотреть текущий список уведомлений:\n/уведомления\nУдалить уведомление по нормеру:\n/удалить <номер уведомления из списка уведомлений>');
    });

	bot.onText(/\/напомни (.+) в (.+)/, function (msg, match) {
	  const userId = msg.from.id;
	  const text = match[1];
	  const time = match[2];
    //   notes.push( { uid:userId, time:time, text:text } );

      if (!users.hasOwnProperty(userId)) { 
            users[userId] = [];
        }
    users[userId].push({message : text, time});

      bot.sendMessage(userId,'Отлично! Я обязательно напомню ' + text +' в ' + time);
    
      const [hours,minutes] = match[2].split(':');
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours - 3, minutes, 0);
      console.log('now = ', now);
      console.log('date = ', date);
      
      const notification = schedule.scheduleJob(date, function(){
        bot.sendMessage(userId, 'Напоминаю, что вы должны: '+ text + ' сейчас.');
        if (users[userId].length === 1) {
            users[userId] = null;
        }
        else {
            users[userId].splice(users[userId].findIndex((note) => note.text === text && note.time === time),1);
        }
        notification.cancel();
      });
      

    });

    bot.onText(/\/уведомления/, function (msg) {
        const notes = users[msg.from.id];
        if (!notes) {
            bot.sendMessage(msg.from.id,'Список уведомление пуст');
        } 
        else {
            const str = notes.map((note, index) => `${index + 1}) ${note.message} ${note.time}`).join('\n');
            bot.sendMessage(msg.from.id, str);
        }
    });
    
    bot.onText(/\/удалить (.+)/, function (msg, match) {
        const userId = msg.from.id;
        let notes = users[userId];
        if (!notes) {
            return bot.sendMessage(userId, 'нечего удалять');
        }
        if (match[1] === 'все' || match[1] === 'всё') {
            users[userId] = null;
         return bot.sendMessage(userId, 'все уведомления удалены');
        } 
        const number = match[1] - 1;
        const str = notes.map((note, index) => `${index + 1}) ${note.message} ${note.time}`).join('\n');
        if (number > notes.length - 1){
          
           return bot.sendMessage(userId, 'не существует уведомления с таким номером\n' + str);
        }
        
        if (notes.length === 1) {
            notes = null;
          return  bot.sendMessage(userId, 'уведомление удалено, список уведомлений пуст:\n');
        } 
    
        notes.splice(number,1);               //ловушка джокера
        const newMessage = notes.map((note, index) => `${index + 1}) ${note.message} ${note.time}`).join('\n');
        bot.sendMessage(userId, 'уведомление удалено, новый список уведомлений:\n' + newMessage);
        
    });


	// setInterval(function(){
	// 	for (var i = 0; i < notes.length; i++){
	// 		let curDate = new Date().getHours() + ':' + new Date().getMinutes();
	// 			if ( notes[i].time == curDate ) {
	// 				bot.sendMessage(notes[i].uid, 'Напоминаю, что вы должны: '+ notes[i].text + ' сейчас.');
	// 				notes.splice(i,1);
	// 			}
	// 		}
    // },1000);
    
    
     