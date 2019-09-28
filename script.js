var face_values = [1, 5, 10, 50, 100, 200, 500, 1000]
function getRndInteger(min, max) 
{
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
function addFinishHandler(anim, el) 
{
  anim.addEventListener('finish', function(e) 
  {
    el.remove()
  }, false);
}
var socket = io("wss://socket.donationalerts.ru:443");
socket.emit('add-user', {token: "", type: "alert_widget"});
socket.on('donation', function(msg){
  var audio = new Audio("audio/donate.mp3");
  audio.play();
  console.log(msg)
  msg = JSON.parse(msg)
  
  // donation
  var header = document.getElementById("header")
  header.innerText = `${msg.username} - ${msg.amount_main} ${msg.currency}`
  var content = document.getElementById("content")
  content.innerText = `${msg.message}`
  var cont = document.getElementById("container")
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
  
  console.log(msg.amount_main)
  var amount = msg.amount_main * 100
  
  for (let i=face_values.length-1; i>=0; --i)
  {
    if (face_values[i] <= amount)
    {
	  var mult = ~~(amount/face_values[i])
	  amount -= mult*face_values[i]
	  var coins = mult > 50 ? 50 : mult
	  var iter = ~~(mult/coins)
	  for (let j=0; j < coins; ++j)
	  {
		// coins
  	    var img = document.createElement("img")
		img.name = "coin"
	    img.src = `img/${msg.currency}/${face_values[i]}.png`
	    img.style.position = "absolute"
		img.style.zIndex = -1
		img.style.opacity = .7
	    var x = getRndInteger(0,1650)
	    img.style.top = "-1000px"
	    img.style.left = `${x}px`
	    document.body.appendChild(img)
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