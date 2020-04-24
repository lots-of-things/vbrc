// ------------------------------
// setup routes
// ------------------------------
let express=require('express');
let app=express();
let server=require('http').createServer(app);

app.use('/',express.static(__dirname + '/client/'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
	res.sendFile(__dirname+'/client/index.html');
});

server.listen(process.env.PORT||8081,()=>{
	console.log('Listening on port '+server.address().port);
});

// ------------------------------
// backend
// ------------------------------
let game={
	lastPlayerId:0,
	io:require('socket.io')(server)
};

game.io.on('connection',(socket)=>{
	let new_player={
		id:game.lastPlayerId++,
		// just choose a place near-ish to the center
		x:rand(-10,10),
		y:rand(-10,10),
		name:"",
		msg:"hi"
	};
	socket.player_id=new_player.id;
	// announce new player
	socket.broadcast.emit('player',new_player);
	// disconnection handler
	socket.on('disconnect',()=>{
		game.io.emit('remove',socket.player_id);
	});
	// this handles any update on the player side. The player decides what information should be passed on.
	socket.on('player',(data)=>{
		// stop timeout
		clearTimeout(socket.timeout);
		// make sure the player id is correct
		data.id=socket.player_id;
		// anything else is just forwarded
		game.io.emit('player',data);
		// reset timeout
		socket.timeout=setTimeout(()=>{
			socket.emit('ping',null);
		},1400);
	});
	// initialise with own player id
	socket.emit('init',socket.player.id);
	// set timeout
	socket.timeout=setTimeout(()=>{
		socket.emit('ping',null);
	},1400);
});
