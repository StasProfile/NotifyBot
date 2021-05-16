const searchParams = new URLSearchParams(location.search);
// const userId = searchParams.get('userId');
const uniqueId = searchParams.get('uniqueId');
const getUserId = async (uniqueId) => {
  const response = await fetch(`users/${uniqueId}`);
  const userId = await response.json();
  return userId;
}

function zero_first_format(value)
  {
      if (value < 10)
      {
          value='0'+value;
      }
      return value;
  }

  /* функция получения текущей даты и времени */
  function date(current_datetime)
  {
      const day = zero_first_format(current_datetime.getDate());
      const month = zero_first_format(current_datetime.getMonth()+1);
      const year = current_datetime.getFullYear();

      return `${year}-${month}-${day}`;
  }

  function time(current_datetime)
  {
      const hours = zero_first_format(current_datetime.getHours());
      const minutes = zero_first_format(current_datetime.getMinutes());
      
      return `${hours}:${minutes}`;
  }

  function createDateTime(current_datetime)
  {
      const day = zero_first_format(current_datetime.getDate());
      const month = zero_first_format(current_datetime.getMonth()+1);
      const year = current_datetime.getFullYear();
      const hours = zero_first_format(current_datetime.getHours());
      const minutes = zero_first_format(current_datetime.getMinutes());

      return `${hours}:${minutes} ${day}.${month}.${year}`;
  }

  function getTime(element) {
    const value = element.innerText.substr(element.innerText.length-27).substr(0, 16);
    return value.substr(0, 5);
  }

  function getDate(element) {
    const res = element.innerText.substr(element.innerText.length-27).substr(0, 16);
    const year = res.substr(res.length - 4);
    const month = res.substr(9,2);;
    const day = res.substr(6,2);
    return `${year}-${month}-${day}`;
  }

  function getText(element) {
    return element.innerText.substring(0, element.innerText.length-30);
  }

  function changeDateFormat(time, date) {
    const month = date.substr(5,2);
    const day = date.substr(8,2);
    return `${time} ${day}/${month}`;
  }

  function toWebFormat(date) {
    const time = date.substr(0,5);
    const day = date.substr(6,2);
    const month = date.substr(9,2);
    const year = '2021';
    return `${time} ${day}.${month}.${year}`;
  }


const showList = async (userId) => {
  const response = await fetch(`notifications/${userId}`);
  const notes = await response.json();
  const elementPlace = document.getElementById('notificationList');
  notes.forEach(note => {
    const newElement = document.createElement('div');
    newElement.className = 'notification';

    const editIcon = document.createElement('span');
    editIcon.className = 'notification__edit';

    editIcon.addEventListener('click', async function() {
      let time = getTime(newElement);
      let date = getDate(newElement);
      let text = getText(newElement);
      console.log(time, ' ', date,' ', text);
      const editDiv = document.createElement('div');
      editDiv.className = 'edit_div';
      const editDate = document.createElement('input');
      editDate.type = 'date';
      editDate.value = date;
      editDate.className = 'edit_date';
      const editTime = document.createElement('input');
      editTime.type = 'time';
      editTime.value = time;
      const editText = document.createElement('textarea');
      editText.value = text;
      const editTitle = document.createElement('p');
      editTitle.innerText = 'Введите новое название уведомления';
      const editSubmit = document.createElement('input');
      editSubmit.className = 'add-button';
      editSubmit.type = 'submit';
      editIcon.remove();
      editDiv.insertAdjacentElement('afterbegin',editDate);
      editDiv.insertAdjacentElement('beforeend',editTime);
      editDiv.insertAdjacentElement('beforeend',editText);
      editDiv.insertAdjacentElement('beforeend',editSubmit);
      newElement.insertAdjacentElement('afterend', editDiv);

      closeIcon.remove();
      const discardIcon = document.createElement('span');
      discardIcon.className = 'notification__edit__discard';
      discardIcon.innerText = 'отменить';
      newElement.insertAdjacentElement('beforeend', discardIcon);

      discardIcon.addEventListener('click', async function() {
        editDiv.remove();
        discardIcon.remove();
        newElement.insertAdjacentElement('beforeend', editIcon);
        newElement.insertAdjacentElement('beforeend', closeIcon);
      })

      editSubmit.addEventListener('click', async function() {
        text = editText.value;
        time = editTime.value;
        date = editDate.value;
        const month = date.substr(5,2);
        const day = date.substr(8,2);
        date = changeDateFormat(time, date);
        console.log("time", time);
        console.log(date);
        const dateNow = new Date();
        const minute = Number(time.substr(0,2));
        const secind = Number(time.substr(3,2));
        const dateNotification = new Date(2021, month - 1, day, minute, secind);
        console.log(dateNow);
        console.log(dateNotification);
        if (dateNotification - dateNow <= 0) {
          return alert('Выберите подходящую дату!');
        }
      
        const respPatch = await fetch(`notifications/${userId}/${note._id}` , {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            date: date,
          })
        });
        const resp = await respPatch.json();
        if (resp.message = "note not found") {
          alert('Уведомление уже отправлено!');
          editDiv.remove();
          newElement.remove();
        }
      
        newElement.insertAdjacentElement('beforeend', editIcon);
        console.log(this.parentElement);
        this.parentElement.remove();
        newElement.innerText = `${text} ${toWebFormat(date)}`;
        newElement.insertAdjacentElement('beforeend', editIcon);
        newElement.insertAdjacentElement('beforeend', closeIcon);
      });
    });

    const closeIcon = document.createElement('span');
    closeIcon.className = 'notification__close';

    closeIcon.addEventListener('click', async function() {
      const respDelete = await fetch(`notifications/${userId}/${note._id}`, { 
        method: 'delete',
      });
      this.parentElement.remove();
    });
    
    editIcon.innerText = 'изменить';
    closeIcon.innerText = 'x';


    newElement.innerText = `${note.message} в ${createDateTime(new Date(note.date))}`;
    newElement.insertAdjacentElement('beforeend', editIcon);
    newElement.insertAdjacentElement('beforeend', closeIcon);

    elementPlace.insertAdjacentElement('beforeend', newElement);
  });
}

window.addEventListener('load', async () => {
  const userId = await getUserId(uniqueId);
  
  if (!uniqueId) {
    return alert('Wrong address');
  }
  const form = document.getElementById('createNotification');
  await showList(userId);
  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    if (this.comment.value === '') {
      return alert('Вы должны написать название уведомления!');
    }
    let date = ``;
    const [year, month, day] = this.calendar.value.split('-');
    const time =  this.cron.value;
    if (!this.calendar.value) {
        date = time;
    }
    date = `${day}/${month}`;
    const dateNow = new Date();
    const minute = Number(time.substr(0,2));
    const secind = Number(time.substr(3,2));
    const dateNotification = new Date(year, month - 1, day, minute, secind);

    if (dateNotification - dateNow <= 0) {
      return alert('Выберите подходящую дату!');
    }

    const respPost = await fetch(`notifications/${userId}`, { method: 'post', headers: {
        'Content-Type': 'application/json'
    } , body: JSON.stringify({
        message: this.comment.value,
        date: `${time} ${date}`
    })});

    if (respPost.ok) {
      const elementPlace = document.getElementById('notificationList');
      while (elementPlace.firstChild) {
        elementPlace.firstChild.remove()
      }
      await showList(userId);
    }
  });
  
  document.getElementById('current_date_block').value = date(new Date());
  document.getElementById('current_time_block').value = time(new Date());
});



