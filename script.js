var face_values = [1, 5, 10, 50, 100, 200, 500, 1000]; // roubles

var emotes = new Map();
var tw_emotes = loadFile('etc/twitch_emotes.txt');
tw_emotes = tw_emotes.split('\n');
tw_emotes.forEach(function(line)
{
  var emote = line.split(' ');
  emotes.set(emote[0], emote[1]); // Name - ID
});

var socket = io("wss://socket.donationalerts.ru:443");
socket.emit('add-user', {token: "", type: "alert_widget"});
socket.on('donation', function(msg){
  console.log(msg);
  msg = JSON.parse(msg);
  
  var amount = msg.amount_main * 100;
  
  mp3 = getAudio(amount);
  var audio = new Audio(mp3);
  audio.play();
  
  // donation
  var header = document.getElementById("header");
  header.innerText = `${url_remover(msg.username)} - ${msg.amount_main} RUB`; // change to "msg.amount" and "msg.currency" later
  var content = document.getElementById("content");
  message = `${url_remover(stripHTML(msg.message))}`;
  var words = message.split(' ');
  message = "";
  words.forEach(function(word) 
  {
	if (/^[oO](_|\.)[oO]$/.test(word))
	{
	  emote_id = 6; // o_O
	}
	else if (/^\:-?(o|O)$/.test(word))
	{
	  emote_id = 8; // :O
	}
	else if (/^\:-?(p|P)$/.test(word))
	{
	  emote_id = 12; // :p
	}
	else if (/^\:-?[\\/]$/.test(word))
	{
	  emote_id = 10; // :/
	}
	else if (/^\:-?[z|Z|\|]$/.test(word))
	{
	  emote_id = 5; // :z
	}
	else if (/^\:-?\($/.test(word))
	{
	  emote_id = 2; // :(
	}
	else if (/^\:-?\)$/.test(word))
	{
	  emote_id = 1; // :)
	}
	else if (/^\:-?D$/.test(word))
	{
	  emote_id = 3; // :D
	}
	else if (/^\;-?(p|P)$/.test(word))
	{
	  emote_id = 13; // ;p
	}
	else if (/^\;-?\)$/.test(word))
	{
	  emote_id = 11; // ;)
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
  
  var cont = document.getElementById("container");
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
	}
  ], {
	  duration: 14000
  });
    
  if (msg.additional_data.includes('"is_commission_covered":1'))
  {
	var heart = document.getElementById("heart");
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
	  }
	], {
		duration: 14000
	});
  }
  
  for (let i = face_values.length - 1; i >= 0; --i)
  {
    if (face_values[i] <= amount)
    {
	  var mult = ~~(amount / face_values[i]);
	  amount -= mult * face_values[i];
	  var coins = mult > 50 ? 50 : mult;
	  var iter = ~~(mult / coins);
	  for (let j=0; j < coins; ++j)
	  {
		// coins
  	    var img = document.createElement("img");
		img.name = "coin";
	    img.src = `img/RUB/${face_values[i]}.png`; // change to "msg.currency" later
	    img.style.position = "absolute";
		img.style.zIndex = -2;
		img.style.opacity = .7;
	    var x = getRndInteger(0,1650);
	    img.style.top = "-1000px";
	    img.style.left = `${x}px`;
	    document.body.appendChild(img);
		var anim = img.animate([
		  {
			transform: "none"
		  },
		  {
			transform: `translate3d(0px, 2080px, 0px) rotate3d(${Math.random()},
			                                                   ${Math.random()},
															   ${Math.random()},
															   ${getRndInteger(5*360, 10*360)}deg)`
		  }
		], {
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
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
function addFinishHandler(anim, el) 
{
  anim.addEventListener('finish', function(e) 
  {
    el.remove();
  }, false);
}
function url_remover(text)
{
    var urlRegex = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi;
    return text.replace(urlRegex, function(url) {
        return '{ rip link :( }';
    })
}
function stripHTML(text)
{
   var doc = new DOMParser().parseFromString(text, 'text/html');
   return doc.body.textContent || "";
}

function emotify(id)
{
  return `<img src="https://static-cdn.jtvnw.net/emoticons/v1/${id}/2.0">`;
}

function getAudio(amount)
{
  if (amount == 69100)
  {
	return "audio/zazazazazaza691.mp3";
  }
  else
  {
	return "audio/donate.mp3";
  }
}

function loadFile(filePath) 
{
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}