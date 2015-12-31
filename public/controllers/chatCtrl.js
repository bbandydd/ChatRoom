app.controller('chatCtrl', ['$scope', 'socket', '$timeout', function ($scope, socket, $timeout) {
	
	$scope.users = [];
	$scope.hasLogined = false;
	$scope.color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).slice(-6);
	$scope.messages = [];

	var typingUser = {};

	$scope.login = function(){
		socket.emit('addUser', {nickname: $scope.nickname, color: $scope.color})
	};

	//登入結果
	socket.on('userAddingResult', function(data){
		if (data.result){
			$scope.userExisted = false;
			$scope.hasLogined = true;
		} else {
			$scope.userExisted = true;
		}
	});

	//接收新用戶加入
	socket.on('userAdded', function(data){
		if (!$scope.hasLogined) return;

		$scope.messages.push({user: data.nickname, type: 'welcome'});
		$scope.users.push(data);
	});

	//接收線上使用者資訊
	socket.on('allUser', function(data){
		if (!$scope.hasLogined) return;

		$scope.users = data;
	});

	//接收使用者離開聊天室
	socket.on('userRemoved', function(data){
		if (!$scope.hasLogined || Object.keys(data).length == 0) return;

		$scope.messages.push({user: data.nickname, type: 'bye'});

		for (var i=0;i<$scope.users.length;i++){
			if ($scope.users[i].nickname == data.nickname){
				$scope.users.splice(i, 1);
			}
		}

	});

	//接收到新訊息
	socket.on('messageAdded', function(data){
		$scope.messages.push(data);

		$scope.scrollBottom();

	});

	//傳送訊息到server
	$scope.postMessage = function(user){
		var msg = {text: $scope.text, type: 'normal', color: $scope.color, from: $scope.nickname, time: new Date()};
		$scope.messages.push(msg);
		$scope.text = '';
		socket.emit("addMessage", msg);
		$scope.scrollBottom();
	};

	//捲動捲軸到底
	$scope.scrollBottom = function(){
		$timeout(function(){
			var messageWrapper = $('.message-wrapper');
			messageWrapper.scrollTop(messageWrapper[0].scrollHeight);
		});
	};

	var typing = false;

	//使用者輸入訊息
	$scope.userTyping = function(){
		if (!typing){
			typing = true;

			socket.emit('typing', {color: $scope.color, nickname: $scope.nickname, time: new Date()});
		}

		if (typeof(typingTimer) != 'undefined'){
			$timeout.cancel(typingTimer);
			delete typingTimer;
		}

		typingTimer = $timeout(function() {
			if (typing){
				typing = false;

				socket.emit('stop typing');
			}
		}, 2000);

	};

	//接收到使用者輸入訊息
	socket.on('typing', function(data){
		var msg = {type: 'typing', isTyping: true, from: data.nickname, color: data.color};
		typingUser[data.nickname] = msg;

		$scope.messages.push(msg);
	});

	//接收到使用者取消輸入訊息
	socket.on('stop typing', function(data){
		typingUser[data.nickname].isTyping = false;
	});

}]);

