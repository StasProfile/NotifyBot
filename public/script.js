const searchParams = new URLSearchParams(location.search);
const userId = searchParams.get('userId');

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

const showList = async () => {
  const response = await fetch(`notifications/${userId}`);
  const notes = await response.json();
  const elementPlace = document.getElementById('notificationList');
  notes.forEach(note => {
    const newElement = document.createElement('div');
    newElement.innerText = `${note.message} в ${createDateTime(new Date(note.date))}`;
    elementPlace.insertAdjacentElement('beforeend', newElement);
  });
}

window.addEventListener('load', async () => {
  const form = document.getElementById('createNotification');
  await showList();
  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    let date = ``;
    const [year, month, day] = this.calendar.value.split('-');
    const time =  this.cron.value;
    
    if (!this.calendar.value) {
        date = time;
    }
    date = `${day}/${month}`;
    
    const resp = await fetch(`notifications/${userId}`, { method: 'post', headers: {
        'Content-Type': 'application/json'
    } , body: JSON.stringify({
        message: this.comment.value,
        date: `${time} ${date}`
    })});

    if (resp.ok) {
      console.log(resp);
      const elementPlace = document.getElementById('notificationList');
      while (elementPlace.firstChild) {
        elementPlace.firstChild.remove()
      }
      await showList();
    }
  });

  var myNodelist = document.getElementsByTagName("LI");
  var i;
  for (i = 0; i < myNodelist.length; i++) {
    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    myNodelist[i].appendChild(span);
  }

  // Click on a close button to hide the current list item
  var close = document.getElementsByClassName("close");
  var i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }

  // Add a "checked" symbol when clicking on a list item
  // var list = document.querySelector('ul');
  // list.addEventListener('click', function(ev) {
  //   if (ev.target.tagName === 'LI') {
  //     ev.target.classList.toggle('checked');
  //   }
  // }, false);

  // // Create a new list item when clicking on the "Add" button
  // function newElement() {
  //   var li = document.createElement("li");
  //   var inputValue = document.getElementById("notificationId").value;
  //   var t = document.createTextNode(inputValue);
  //   li.appendChild(t);
  //   if (inputValue === '') {
  //     alert("You must write something!");
  //   } else {
  //     document.getElementById("myUL").appendChild(li);
  //   }
  //   document.getElementById("notificationId").value = "";

  //   var span = document.createElement("SPAN");
  //   var txt = document.createTextNode("\u00D7");
  //   span.className = "close";
  //   span.appendChild(txt);
  //   li.appendChild(span);

  //   for (i = 0; i < close.length; i++) {
  //     close[i].onclick = function() {
  //       var div = this.parentElement;
  //       div.style.display = "none";
  //     }
  //   }
  // }

  /* функция добавления ведущих нулей */
      /* (если число меньше десяти, перед числом добавляем ноль) */
  
  document.getElementById('current_date_block').value = date(new Date());
  document.getElementById('current_time_block').value = time(new Date());
});



