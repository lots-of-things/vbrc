let self=false;
let socket=false;

function send(){
	if(self!==false){
		// send all player data
		socket.emit('player',self);
	}
}

function login(){
	self={
		x:175,
		y:320,
		name:document.getElementById('name').value,
		msg:document.getElementById('msg').value,
	};

	socket=io();

	socket.on('init',(data)=>{
		self.id=data;
		console.info('self',self);
		document.body.classList.add('connected');
		// announce to other players
		send();
	});

	socket.on('ping',send);
	socket.on('player',updatePlayer);

	socket.on('remove',(id)=>{
		document.getElementById('player_'+id).remove();
	});
	
	// setup key handlers
	// this catches automatic key repeats
	document.body.addEventListener('keydown',(evt)=>{
		switch(evt.key){
			case 'ArrowRight':
				self.x++;
				break;
			case 'ArrowLeft':
				self.x--;
				break;
			case 'ArrowDown':
				self.y++;
				break;
			case 'ArrowUp':
				self.y--;
				break;
		}
		// to reduce lag on own player
		updatePlayer(self);
	});

	/*
	keyup does not catch automatic key repeats
	so this only send when we are finished moving
	*/
	document.body.addEventListener('keyup',send);
}

function updatePlayer(p){
	let elem=document.getElementById('player_'+p.id);
	if(elem===null){
		elem=document.createElement('div');
		elem.id='player_'+p.id;
		elem.classList.add('player');
		document.getElementById('players').appendChild(elem);

		let name=document.createElement('span');
		name.classList.add('name');
		elem.appendChild(name);

		let msg=document.createElement('span');
		msg.classList.add('msg');
		elem.appendChild(msg);
	}
	if(typeof p.x!='undefined'){
		// there is new position data
		elem.style.setProperty('--x',p.x);
		elem.style.setProperty('--y',p.y);
	}
	if(typeof p.name!='undefined'){
		// there is a new name
		elem.querySelector('.name').innerText=p.name;
	}
	if(typeof p.msg!='undefined'){
		// there is a new message
		elem.querySelector('.msg').innerText=p.msg;
	}

	if(p.id==self.id){
		// own player moved, update viewport
		document.body.style.setProperty('--bg-x',self.x);
		document.body.style.setProperty('--bg-y',self.y);
	}
}