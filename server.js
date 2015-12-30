var express = require('express');
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendfile('index.html');
});

var connectedSockets = {};
var allUsers = [];

io.on('connection', function(socket){

	//新使用者加入
	socket.on('addUser', function(data){   
		if (connectedSockets[data.nickname]){
			socket.emit('userAddingResult', {result: false});
		} else {
			socket.emit('userAddingResult', {result: true});
			socket.nickname = data.nickname;
			connectedSockets[data.nickname] = socket; //發私訊用
			allUsers.push(data);
			socket.broadcast.emit('userAdded', data);
			socket.emit('allUser', allUsers);
		}
	});

	//使用者離開聊天室
	socket.on('disconnect', function(){

		if (socket.nickname){
			socket.broadcast.emit('userRemoved', {nickname: socket.nickname});

			for (var i=0;i<allUsers.length;i++){
				if (allUsers[i].nickname == socket.nickname){
					allUsers.splice(i, 1);
				}
			}

			delete connectedSockets[socket.nickname];
		}

	});

	//發送訊息
	socket.on('addMessage', function(data){
		socket.broadcast.emit('messageAdded', data);
	});
});

server.listen(8001, function(){
	console.log('connection');
});