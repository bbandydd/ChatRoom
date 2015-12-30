app.controller('chatCtrl', ['$scope', 'socket', '$timeout', function ($scope, socket, $timeout) {
	
	$scope.users = [];
	$scope.hasLogined = false;
	$scope.color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).slice(-6);
	$scope.messages = [];

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
		var index = $scope.users.indexOf(data.nickname);
		$scope.users.splice(index, 1);
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

	$scope.scrollBottom = function(){
		$timeout(function(){
			var messageWrapper= $('.message-wrapper');
			messageWrapper.scrollTop(messageWrapper[0].scrollHeight);
		});
	};

}]);

