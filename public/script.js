const searchParams = new URLSearchParams(location.search);
// const userId = searchParams.get('userId');
const uniqueId = searchParams.get('uniqueId');

const getUserId = async (uniqueId) => {
  console.log(uniqueId);
  const response = await fetch(`users/${uniqueId}`);
  const userId = await response.json();
  console.log(userId);
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




const showList = async (userId) => {
  const response = await fetch(`notifications/${userId}`);
  const notes = await response.json();
  const elementPlace = document.getElementById('notificationList');
  notes.forEach(note => {
    const newElement = document.createElement('div');
    newElement.className = 'notification';

    const closeIcon = document.createElement('span');
    closeIcon.className = 'notification__close';

    closeIcon.addEventListener('click', async function() {
      const respDelete = await fetch(`notifications/${userId}/${note._id}`, { 
        method: 'delete',
      });

      this.parentElement.remove();
    });
    
    closeIcon.innerText = 'x';


    newElement.innerText = `${note.message} в ${createDateTime(new Date(note.date))}`;
    newElement.insertAdjacentElement('beforeend', closeIcon)

    elementPlace.insertAdjacentElement('beforeend', newElement);
  });
}

window.addEventListener('load', async () => {
  const userId = await getUserId(uniqueId);
  console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", userId);
  // console.log('load is over');
  // // const userId = await fetch(`users/${uniqueId}`);;
  // console.log(userId);
  if (!uniqueId) {
    return alert('Wrong address');
  }
  const form = document.getElementById('createNotification');
  await showList(userId);
  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    let date = ``;
    const [year, month, day] = this.calendar.value.split('-');
    const time =  this.cron.value;
    
    if (!this.calendar.value) {
        date = time;
    }
    date = `${day}/${month}`;
    
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



