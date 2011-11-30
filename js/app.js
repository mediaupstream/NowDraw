paper.install(window);
// Keep global references to both tools, so the HTML
// links below can access them.
var lineTool, cloudTool, selected = 'lineTool', User = {}, userId = '';

window.onload = function() {
	paper.setup('draw');
	
	var group = new Group();
	
	var toolbar = {
		fn: {
			lineTool: function(){
				selected = 'lineTool';
				User[userId] = null;
				lineTool.activate();
			},
			cloudTool: function(){
				selected = 'cloudTool';
				User[userId] = null;
				cloudTool.activate();
			},
			clearCanvas: function(){
				now.clearCanvas();
			}
		},
		init: function(){
			$('#toolbar a').click(function(e){
				e.preventDefault();
				var method = $(this).attr('data-tool');
				if(typeof toolbar['fn'][method] == 'function'){
					toolbar['fn'][method]();
				}
			}).filter('.toggle').click(function(){
				$('#toolbar a').removeClass('active');
				$(this).addClass('active');
			});
		}
		
	}
	
	pathStyle = {
		strokeColor: '#63d4ff',
		strokeWidth: 5
	};
	
	now.resetCanvas = function(){
		group.removeChildren();
		paper.view.draw();
	};
	
	now.receiveUserCount = function(num){
	  $('#appTitle b').text(num);
	};
	
	now.connected = function(id, data){
	  userId = id;
	  now.distributeUserCount();
    // draw everything for this user from the `data` passed in
    $.each(data, function(i, d){
      now.drawPoints(d[0], d[1], d[2], d[3]);
    });
	};
	
	now.disconnected = function(userId){
	  now.distributeUserCount();
	};
	
	
	now.drawPoints = function(user, tool, p, color){

			switch(tool){
				case 'lineTool': {
					User[user] = {'path': new Path() };
					User[user].path.style = pathStyle;
					User[user].path.strokeColor = color;
					
					group.addChild(User[user].path);
					for(var i=0, len=p.length; i<len; i++){
						var _s = p[i].split('|');
						User[user].path.add({"x": parseInt(_s[0]), "y": parseInt(_s[1])});
					}
					User[user].path.simplify(10);
					paper.view.draw();
					points.length = 0;
				
				}; break;
				case 'cloudTool': {
					User[user] = {'path': new Path() };
					User[user].path.style = pathStyle;
					User[user].path.strokeColor = color;
					
					group.addChild(User[user].path);
					var _s = p[0].split('|');
					User[user].path.add({"x": parseInt(_s[0]), "y": parseInt(_s[1])});
					for(var i=1, len=p.length-1; i<len; i++){
						var _p = p[i].split('|');
						User[user].path.arcTo({"x": parseInt(_p[0]), "y": parseInt(_p[1])});
					}
					paper.view.draw();
					points.length = 0;
					// User[user] = {'path': new Path() };
				
				}; break;
		}
	};
	
	// Create two drawing tools.
	// lineTool will draw straight lines,
	// cloudTool will draw clouds.

	var points = [];
	
	var onMouseDown = function(event) {
		User[userId] = { path: new Path() };
		User[userId].path.style = pathStyle;
		
		// Path.Circle(new Point(120, 50), 35);
		
		var hue = event.count * 15;
		var color = new HSBColor(hue, 1, 1);
		User[userId].path.strokeColor = color;
		
		User[userId].path.add(event.point);
		group.addChild(User[userId].path);
		points.push(event.point.x +'|'+ event.point.y);
	};

	var onMouseUp = function(event) {
		if(selected == 'lineTool'){
			User[userId].path.simplify(10);
		}
		points.push(event.point.x +'|'+ event.point.y);
		var color = User[userId].path.strokeColor.toCssString();
		// broadcast to NowJS
		now.sendEvent(selected, points, color);
		points.length = 0;
	};
	

	lineTool = new Tool();
	lineTool.onMouseDown	= onMouseDown;
	lineTool.onMouseUp		= onMouseUp;

	lineTool.onMouseDrag = function(event) {
		if(typeof User[userId].path == 'undefined'){
			User[userId] = { path: new Path() };
		}
		User[userId].path.add(event.point);
		points.push(event.point.x +'|'+ event.point.y);
	};
	
	
	

	cloudTool = new Tool();
	cloudTool.minDistance = 20;
	cloudTool.onMouseDown	= onMouseDown;
	cloudTool.onMouseUp 	= onMouseUp;
	
	cloudTool.onMouseDrag = function(event) {
		if(typeof User[userId].path == 'undefined'){
			User[userId] = { path: new Path() };
		}
		// Use the arcTo command to draw cloudy lines
		User[userId].path.arcTo(event.point);
		// save points
		points.push(event.point.x +'|'+ event.point.y);
	};
	
	// setup the toolbar bindings
	toolbar.init();
}