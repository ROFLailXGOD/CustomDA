const face_values = [1, 5, 10, 50, 100, 200, 500, 1000]; // roubles

let emotes = new Map();
let tw_emotes = loadFile('etc/twitch_emotes.txt');
tw_emotes = tw_emotes.split('\n');
tw_emotes.forEach(function(line)
{
  let emote = line.split(' ');
  emotes.set(emote[0], emote[1]); // Name - ID
});

let socket = io('wss://socket.donationalerts.ru:443');
socket.emit('add-user',
{
  token: '',
  type: 'alert_widget'
});
socket.on('donation', function(msg)
{
  console.log(msg);
  msg = JSON.parse(msg);
  // donation
  let header = document.getElementById('header');
  header.innerText = `${url_remover(msg.username)} - ${msg.amount_main} RUB`; // change to 'msg.amount' and 'msg.currency' later
  let content = document.getElementById('content');
  let message = `${url_remover(stripHTML(msg.message))}`;

  let amount = msg.amount_main * 100;

  let mp3 = getAudio(amount);
  let audio = new Audio(mp3);
  audio.play();
  // tts if donation is >= 50 rub
  audio.addEventListener('ended', function(){
    if (msg.amount_main * 100 >= 5000)
    {
      let tts = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(tts);
    }
  });

  let words = message.split(' ');
  message = '';
  words.forEach(function(word)
  {
    let emote_id;
    if (/^\:-?\)$/.test(word))
    {
      emote_id = 1; // :)
    }
    else if (/^\:-?\($/.test(word))
    {
      emote_id = 2; // :(
    }
    else if (/^\:-?D$/.test(word))
    {
      emote_id = 3; // :D
    }
    else if (/^\:-?[z|Z|\|]$/.test(word))
    {
      emote_id = 5; // :z
    }
    else if (/^[oO](_|\.)[oO]$/.test(word))
    {
      emote_id = 6; // o_O
    }
    else if (/^B-?\)$/.test(word))
    {
      emote_id = 7; // B)
    }
    else if (/^\:-?(o|O)$/.test(word))
    {
      emote_id = 8; // :O
    }
    else if (/^\:-?[\\/]$/.test(word))
    {
      emote_id = 10; // :/
    }
    else if (/^\;-?\)$/.test(word))
    {
      emote_id = 11; // ;)
    }
    else if (/^\:-?(p|P)$/.test(word))
    {
      emote_id = 12; // :p
    }
    else if (/^\;-?(p|P)$/.test(word))
    {
      emote_id = 13; // ;p
    }
    else
    {
      emote_id = emotes.get(word);
    }

    if (emote_id !== undefined)
    {
      message = `${message} ${emotify(emote_id)}`;
    }
    else
    {
      message = `${message} ${word}`;
    }
  });
  content.innerHTML = message;

  let cont = document.getElementById('container');
  cont.animate([
  {
    opacity: 0,
    offset: 0
  },
  {
    opacity: 1,
    offset: .14
  },
  {
    opacity: 1,
    offset: .86
  },
  {
    opacity: 0,
    offset: 1
  }],
  {
    duration: 14000
  });

  if (msg.additional_data.includes('"is_commission_covered":1'))
  {
    let heart = document.getElementById('heart');
    heart.animate([
    {
      opacity: 0,
      offset: 0
    },
    {
      opacity: 0.7,
      offset: .14
    },
    {
      opacity: 0.7,
      offset: .86
    },
    {
      opacity: 0,
      offset: 1
    }],
    {
      duration: 14000
    });
  }

  for (let i = face_values.length - 1; i >= 0; --i)
  {
    if (face_values[i] <= amount)
    {
      const mult = ~~(amount / face_values[i]);
      amount -= mult * face_values[i];
      const coins = mult > 50 ? 50 : mult;
      const iter = ~~(mult / coins);
      for (let j = 0; j < coins; ++j)
      {
        // coins
        let img = document.createElement('img');
        img.name = 'coin';
        img.src = `img/RUB/${face_values[i]}.png`; // change to 'msg.currency' later
        img.style.position = 'absolute';
        img.style.zIndex = -2;
        img.style.opacity = .7;
        const x = getRndInteger(0, 1650);
        img.style.top = '-1000px';
        img.style.left = `${x}px`;
        document.body.appendChild(img);
        let anim = img.animate([
        {
          transform: 'none'
        },
        {
          transform: `translate3d(0px, 2080px, 0px) rotate3d(${Math.random()},
  			                                                     ${Math.random()},
  															                             ${Math.random()},
  															                             ${getRndInteger(5*360, 10*360)}deg)`
        }],
        {
          duration: getRndInteger(3500, 10000),
          iterations: `${iter}`
        });
        addFinishHandler(anim, img);
      }
    }
  }

});

function getRndInteger(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function addFinishHandler(anim, el)
{
  anim.addEventListener('finish', function()
  {
    el.remove();
  });
}

function url_remover(text)
{
  let urlRegex = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi;
  return text.replace(urlRegex, '{ rip link :( }')
}

function stripHTML(text)
{
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.body.textContent || ''
}

function emotify(id)
{
  return `<img src='https://static-cdn.jtvnw.net/emoticons/v1/${id}/2.0'>`
}

function getAudio(amount)
{
  if (amount == 69100)
  {
    return 'audio/zazazazazaza691.mp3'
  }
  else
  {
    return 'audio/donate.mp3'
  }
}

function loadFile(filePath)
{
  let result = null;
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.open('GET', filePath, false);
  xmlhttp.send();
  if (xmlhttp.status == 200)
  {
    result = xmlhttp.responseText;
  }
  return result
}
