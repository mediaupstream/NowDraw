paper.install(window);
// Keep global references to both tools, so the HTML
// links below can access them.
var lineTool, cloudTool, selected = 'lineTool', User = {}, userId = '';

window.onload = function() {
	paper.setup('draw');
	
	userId = window.now.userId;
	
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
	
	now.drawPoints = function(user, tool, p){

			switch(tool){
				case 'lineTool': {
					User[user] = {'path': new Path() };
					User[user].path.style = pathStyle;
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
		User[userId].path.strokeColor = new HSBColor(hue, 1, 1);
		
		User[userId].path.add(event.point);
		group.addChild(User[userId].path);
		points.push(event.point.x +'|'+ event.point.y);
	};

	var onMouseUp = function(event) {
		if(selected == 'lineTool'){
			User[userId].path.simplify(10);
		}
		points.push(event.point.x +'|'+ event.point.y);
		// broadcast to NowJS
		now.sendEvent(userId, selected, points);
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