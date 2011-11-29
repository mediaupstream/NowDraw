var fs = require('fs'),
		sys = require('sys'),
		express = require('express'),
		app = express.createServer();

app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/'));
	app.use(app.router);
});

var port = process.env.PORT || 3000;

app.set('view options', { layout: false });

app.get('/', function(req, res){
	res.render('index.ejs', {'port': port});
});


app.listen(port);

// Hot Sauce! ... NowJS Stuff below
var nowjs = require('now'), everyone;
if (process.env.PORT) {
	// Production
	everyone = nowjs.initialize(app, {'port': 80, 'socketio':{
		"transports": ["xhr-polling"],
		"polling duration": 10,
		"log level": 0
	}});
} else {
	// Development
	console.log('=========== development mode ===========');
	everyone = nowjs.initialize(app, {"log level": 1});
}

nowjs
	.on('connect', function(){
		this.now.userId = this.user.clientId;
		// console.log('User Connected: '+ this.now.userId);
	})
	.on('disconnect', function(){
		// this.now.userId = this.user.clientId;
		// console.log('DISCONNECTED: '+ this.now.userId);
});

everyone.now.sendEvent = function(user, tool, points){
	everyone.exclude([this.user.clientId]).now.drawPoints(user, tool, points);
};

everyone.now.clearCanvas = function(){
	everyone.now.resetCanvas();
};