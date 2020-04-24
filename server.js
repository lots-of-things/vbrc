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

function start_timeout(socket){
	socket.timeout=setTimeout(()=>{
		socket.emit('ping');
		socket.timeout=setTimeout(()=>{
			// not responding, disconnect
			socket.disconnect(true);
		},10000);
	},3000);
}

function stop_timeout(socket){
	clearTimeout(socket.timeout);
}

game.io.on('connection',(socket)=>{
	socket.player_id=game.lastPlayerId++;
	// disconnection handler
	socket.on('disconnect',()=>{
		game.io.emit('remove',socket.player_id);
	});
	// this handles any update on the player side. The player decides what information should be passed on.
	socket.on('player',(data)=>{
		stop_timeout(socket);
		// make sure the player id is correct
		data.id=socket.player_id;
		// anything else is just forwarded
		game.io.emit('player',data);
		// reset timeout
		start_timeout(socket);
	});
	// initialise with own player id
	socket.emit('init',socket.player_id);

	start_timeout(socket);
});
