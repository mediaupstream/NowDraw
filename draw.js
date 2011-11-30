/**
 *  draw.js - Entry point to the NowDraw application
 *
 *  run with `node draw.js`
 */
var fs = require('fs'),
		sys = require('sys'),
		express = require('express'),
		app = express.createServer(),
		port = process.env.PORT || 3000,
		users = 0,
		paper = [];

// Configure Express (http://expressjs.com)
app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/'));
	app.use(app.router);
});

// Do not render our views with a layout
app.set('view options', { layout: false });

// Render the index.ejs file
app.get('/', function(req, res){
	res.render('index.ejs', {'port': port});
});

// Start the Express server
app.listen(port);

// - - - - - - - - - - - - - - - - - NowJS stuff below ;-)

var nowjs = require('now'), everyone;
if (process.env.PORT) {
	// Production code uses xhr-polling, required by my app host (Heroku)
	// - You should probably use `nowjs.initialize(app);` for production if you can.
	everyone = nowjs.initialize(app, {'port': 80, 'socketio':{
		"transports": ["xhr-polling"],
		"polling duration": 10,
		"log level": 0
	}});
} else {
	// Development mode, log the server port
	console.log('============= development mode =============');
	console.log(' Server running at http://127.0.0.1:'+port);
	everyone = nowjs.initialize(app, {"log level": 1});
}

// What to do when a user connects / disconnects from the app
nowjs
	.on('connect', function(){
	  // Update user count
	  users++;
		this.now.userId = this.user.clientId;
		this.now.connected(this.user.clientId, paper);
		// console.log('User Connected: '+ this.now.userId);
	})
	.on('disconnect', function(){
    // Update user count
	  users--;
    users = (users < 0) ? 0 : users;
    everyone.now.disconnected(this.user.clientId);
		// console.log('DISCONNECTED: '+ this.now.userId);
});

/**
 *  sendEvent - Share line data with all users
 *  
 *  This is called on the client when a user is done drawing a line
 *  Point data and the tool used are transmitted to the `drawPoints` clientside function
 */
everyone.now.sendEvent = function(tool, points, color){
  var user = this.now.userId;
  paper.push([user, tool, points, color]);
	everyone.exclude([this.user.clientId]).now.drawPoints(user, tool, points, color);
};

/**
 *  clearCanvas - Clears the canvas for everyone.
 */
everyone.now.clearCanvas = function(){
  paper = [];
	everyone.now.resetCanvas();
};

/**
 *  Update the user count for all connected users
 *  
 */
everyone.now.distributeUserCount = function(){
  everyone.now.receiveUserCount(users);
};