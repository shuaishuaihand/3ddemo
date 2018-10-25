var demo={
	LAZY_MIN: 1000,
	LAZY_MAX: 6000,
	CLEAR_COLOR: '#39609B',	
	RES_PATH: 'res',
	
	lastElement: null,
	timer: null,
	
	getRes: function(file){
		return demo.RES_PATH+'/'+file;
	},

	getEnvMap: function(){
		if(!demo.defaultEnvmap){			
			demo.defaultEnvmap=[];
			var image=demo.getRes('room.jpg');
			for(var i=0;i<6;i++){
				demo.defaultEnvmap.push(image);
			}
		}
		return demo.defaultEnvmap;
	},
	
	//all registered object creaters.
	_creators: {},

	//all registered object filters.
	_filters: {},

	//all registered shadow painters.
	_shadowPainters: {},

	registerCreator: function(type, creator){
		this._creators[type] = creator;
	},
	
	getCreator: function(type){
		return this._creators[type];
	},
	
	registerFilter: function(type, filter){
		this._filters[type] = filter;
	},
	
	getFilter: function(type){
		return this._filters[type];
	},

	registerShadowPainter: function(type, painter){
		this._shadowPainters[type] = painter;
	},
	
	getShadowPainter: function(type){
		return this._shadowPainters[type];
	},
	
	init: function(htmlElementId){				
		var gl3dview= new mono.Gl3dview3D();
		demo.typeFinder = new mono.QuickFinder(gl3dview.getServa(), 'type', 'client');

		var gleye = new mono.PerspectiveGleye(30, 1.5, 30, 30000);		
		gl3dview.setGleye(gleye);
		
		var interaction = new mono.DefaultInteraction(gl3dview);
		interaction.yLowerLimitAngle=Math.PI/180*2;
		interaction.yUpLimitAngle=Math.PI/2;
		interaction.maxDistance=10000;
		interaction.minDistance=50;
		interaction.zoomSpeed=3;
		interaction.panSpeed=0.2;

		//机柜是否允许拖拽，缩放，旋转
		var editInteraction = new mono.EditInteraction(gl3dview);
		editInteraction.setShowHelpers(true);
        editInteraction.setScaleable(false);
        editInteraction.setRotateable(false);
        editInteraction.setTranslateable(true);

		gl3dview.setInteractions([interaction, new mono.SelectionInteraction(gl3dview), editInteraction]);

		gl3dview.isSelectable = function(element){
			return gl3dview.moveView && element.getClient('type') === 'rack';
		};	
		gl3dview.editableFunction = function(element){
			return gl3dview.moveView && element.getClient('type') === 'rack';
		}	
		document.getElementById(htmlElementId).appendChild(gl3dview.getRootView());
		var tooltip = new Tooltip(['BusinessId'],['000000']);
		document.body.appendChild(tooltip.getView());

		var personLoaded = false;
		
		/*var buttons=[{
			label: '场景复位',
			icon: 'reset.png',
			clickFunction: function(){							
				demo.resetView(gl3dview);
			},
		},{
			label: '走线管理',
			icon: 'connection.png',
			clickFunction: function(){
				var showing=gl3dview.connectionView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleConnectionView(gl3dview);
				}
			}
		},{
			label: '人工路径',
			icon: 'person.png',
			clickFunction: function(){
				demo.togglePersonVisible(personLoaded, gl3dview);
				personLoaded = !personLoaded;
			}
		},{
			label: '调试信息',
			icon: 'fps.png',
			clickFunction: function(){
				demo.toggleFpsView(gl3dview);
			}
		},{
			label: '拖拽机柜',
			icon: 'edit.png',
			clickFunction: function(){
				var showing=gl3dview.moveView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleMoveView(gl3dview);
				}
			}
		},{
			label: '温度图',
			icon: 'temperature.png',
			clickFunction: function(){				
				var showing=gl3dview.temperatureView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleTemperatureView(gl3dview);
				}
			}
		},{
			label: '可用空间',
			icon: 'space.png',
			clickFunction: function(){			
				var showing=gl3dview.spaceView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleSpaceView(gl3dview);
				}
			}
		},{
			label: '机柜利用率',
			icon: 'usage.png',
			clickFunction: function(){
				var showing=gl3dview.usageView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleUsageView(gl3dview);
				}
			}
		},{
			label: '空调风向',
			icon: 'air.png',
			clickFunction: function(){		
				var showing=gl3dview.airView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleAirView(gl3dview);
				}
			}
		},{
			label: '烟雾监控',
			icon: 'smoke.png',
			clickFunction: function(){		
				var showing=gl3dview.smokeView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleSmokeView(gl3dview);
				}
			}
		},{
			label: '漏水监测',
			icon: 'water.png',
			clickFunction: function(){		
				var showing=gl3dview.waterView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleWaterView(gl3dview);
				}
			}
		},{
			label: '防盗监测',
			icon: 'security.png',
			clickFunction: function(){			
				var showing=gl3dview.laserView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.toggleLaserView(gl3dview);
				}
			}
		},{
			label: '供电电缆',
			icon: 'power.png',
			clickFunction: function(){			
				var showing=gl3dview.powerView;
				demo.resetView(gl3dview);
				if(!showing){
					demo.togglePowerView(gl3dview);
				}
			}
		},{
			label: '告警巡航',
			icon: 'alarm.png',
			clickFunction: function(){			
				if(gl3dview.inspecting){
					return;
				}
				demo.resetView(gl3dview);
				demo.resetRackPosition(gl3dview);
				gl3dview.inspecting=true;
				demo.inspection(gl3dview);
			}		
		}];
		demo.setupToolbar(buttons);*/

		mono.Utils.autoAdjustGl3dviewBounds(gl3dview,document.documentElement,'clientWidth','clientHeight');
		gl3dview.getRootView().addEventListener('dblclick', function(e){
			demo.handleDoubleClick(e, gl3dview);
		});	
		gl3dview.getRootView().addEventListener('mousemove',function(e){
			demo.handleMouseMove(e, gl3dview, tooltip);
		});

		demo.setupLights(gl3dview.getServa());
		gl3dview.getServa().getAlarmBox().addServaChangeListener(function(e){
			var alarm = e.data;
			if(e.kind === 'add'){
				var node = gl3dview.getServa().getDataById(alarm.getElementId());
				node.setStyle('m.alarmColor', null);
			}
		});

		gl3dview.getServa().addDataPropertyChangeListener(function(e){
			var element = e.source, property = e.property, oldValue = e.oldValue, newValue = e.newValue;
			if(property == 'position' && gl3dview.moveView){
				if(oldValue.y != newValue.y){
					element.setPositionY(oldValue.y);
				}
			}

		});
		
	/*	gl3dview.addInteractionListener(function(e){
			if(e.kind == 'liveMoveEnd'){				
				demo.dirtyShadowMap(gl3dview);
			}
		});*/

		var time1=new Date().getTime();
		demo.loadData(gl3dview);
		var time2=new Date().getTime();		
		console.log('time:  ' + (time2-time1));

		/*demo.startSmokeAnimation(gl3dview);
		demo.startFpsAnimation(gl3dview);*/
		demo.resetGleye(gl3dview);
	},
	
	resetGleye: function(gl3dview){
		gl3dview.getGleye().setPosition(2000,1200,3000);
		gl3dview.getGleye().lookAt(new mono.XiangliangThree(0,0,0));
	},

	dirtyShadowMap: function(gl3dview){
		var floor = gl3dview.getServa().shadowHost;
		var floorCombo = demo.typeFinder.findFirst('floorCombo');
		demo.updateShadowMap(floorCombo, floor, floor.getId(),gl3dview.getServa());
	},





	setupLights: function(box){
		var pointLight = new mono.PointLight(0xFFFFFF,0.3);
		pointLight.setPosition(0,1000,-1000);
		box.add(pointLight);     
		
		var pointLight = new mono.PointLight(0xFFFFFF,0.3);
		pointLight.setPosition(0,1000,1000);
		box.add(pointLight);        

		var pointLight = new mono.PointLight(0xFFFFFF,0.3);
		pointLight.setPosition(1000,-1000,1000);
		box.add(pointLight);        

		box.add(new mono.AmbientLight('white'));	
	},

	handleDoubleClick: function(e, gl3dview){
		var gleye=gl3dview.getGleye();
		var interaction=gl3dview.getDefaultInteraction();
		var firstClickObject=demo.findFirstObjectByMouse(gl3dview,e);
		
		if(firstClickObject){
			var element=firstClickObject.element;		
			var newTarget=firstClickObject.point;
			var oldTarget=gleye.getTarget();
			demo.animateGleye(gleye, interaction, oldTarget, newTarget, function(){
				if(element.getClient('animation')){
					demo.playAnimation(element, element.getClient('animation'));
				}				
			});
			//点击摄像头
			if(element.getClient('dbl.func')){				
				var func=element.getClient('dbl.func');
				func();
			}
            if(element.getClient('ser.func')){
                var func=element.getClient('ser.func');
                func();
            }
		}else{
			var oldTarget=gleye.getTarget();
			var newTarget=new mono.XiangliangThree(0,0,0);
			demo.animateGleye(gleye, interaction, oldTarget, newTarget);
		}
	},

	//鼠标移动到网元上1S后显示tooltip
    handleMouseMove: function(e, gl3dview, tooltipObj){ 
        var objects = gl3dview.getElementsByMouseEvent(e);
        //获取当前网元，如果当前鼠标下有对象并且类型为group，那么就设置currentElement为鼠标下的网元
        var currentElement = null;
        var tooltip = tooltipObj.getView();
        // var tooltip = document.getElementById('tooltip');
        if (objects.length) {           
            var first = objects[0];
            var object3d = first.element;
            if(object3d.getClient('type') === 'card' && object3d.getClient('isAlarm')){ 
                currentElement = object3d;
                tooltipObj.setValues([object3d.getClient('BID')]);
            }
        }
        //如果当前和上一次的网元不一致，先清除timer。
        //如果当前网元有值，起一个timer，2S后显示tooltip。
        //tooltip显示的位置为最近一次鼠标移动时的位置
        if (demo.lastElement != currentElement ) {
            clearTimeout(demo.timer);
            if(currentElement){
               demo.timer = setTimeout(function(){
                    tooltip.style.display = 'block';
                    tooltip.style.position = 'absolute';
                    tooltip.style.left = (window.lastEvent.pageX - tooltip.clientWidth/2) + 'px';
                    tooltip.style.top = (window.lastEvent.pageY - tooltip.clientHeight - 15) + 'px';
                },1000); 
            }     
        }
        //设置上一次的网元为当前网元
        demo.lastElement = currentElement; 
        //如果当前鼠标下没有网元，隐藏tooltip
        if(currentElement == null){
            tooltip.style.display = 'none';
        }
        //设置每次移动时鼠标的事件对象
        window.lastEvent = e;
    },

	copyProperties: function(from, to, ignores){
		if(from && to){
			for(var name in from){
				if(ignores && ignores.indexOf(name)>=0){
					//ignore.
				}else{
					to[name]=from[name];
				}
			}
		}
	},

	createCubeObject: function(json){
		var translate=json.translate || [0,0,0];
		var width=json.width;
		var height=json.height;
		var depth=json.depth;
		var sideColor=json.sideColor;
		var topColor=json.topColor;

		var object3d=new mono.Cube(width, height, depth);				
		object3d.setPosition(translate[0], translate[1]+height/2, translate[2]);					
		object3d.s({
			'm.color': sideColor,
			'm.ambient': sideColor,
			'left.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
			'right.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
			'front.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
			'back.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
			'top.m.color': topColor,
			'top.m.ambient': topColor,						
			'bottom.m.color': topColor,
			'bottom.m.ambient': topColor,						
		});

		return object3d;
	},
	
	create2DPath: function(pathData) {
		var path;
		for(var j=0;j<pathData.length;j++){
			var point=pathData[j];
			if(path){
				path.lineTo(point[0],point[1], 0);
			}else{
				path=new mono.Path();
				path.moveTo(point[0],point[1], 0);
			}
		}

		return path;
	},
	
	create3DPath: function(pathData) {
		var path;
		for(var j=0;j<pathData.length;j++){
			var point=pathData[j];
			if(path){
				path.lineTo(point[0],point[1], point[2]);
			}else{
				path=new mono.Path();
				path.moveTo(point[0],point[1], point[2]);
			}
		}

		return path;
	},

	createPathObject: function(json){
		var translate=json.translate || [0,0,0];
		var pathWidth=json.width;
		var pathHeight=json.height;		
		var pathData=json.data;					
		var path=this.create2DPath(pathData);
		var pathInsideColor=json.insideColor;
		var pathOutsideColor=json.outsideColor;
		var pathTopColor=json.topColor;
		
		var object3d=this.createWall(path, pathWidth, pathHeight, pathInsideColor, pathOutsideColor, pathTopColor);
		object3d.setPosition(translate[0], translate[1], -translate[2]);	
		object3d.shadow=json.shadow;

		return object3d;
	},

	filterJson: function(box, objects){
		var newObjects=[];

		for(var i=0; i<objects.length; i++){
			var object=objects[i];
			var type=object.type;
			var filter=this.getFilter(type);
			if(filter){
				var filteredObject=filter(box, object);
				if(filteredObject){
					if(filteredObject instanceof Array){
						newObjects=newObjects.concat(filteredObject);						
					}else{
						this.copyProperties(object, filteredObject, ['type']);
						newObjects.push(filteredObject);
					}
				}
			}else{
				newObjects.push(object);				
			}
		}
		
		return newObjects;
	},

	createCombo: function(parts){
		var children=[];		
		var ops=[];
		var ids=[];
		for(var i=0;i<parts.length;i++){
			var object=parts[i];
			var op=object.op || '+';
			var style=object.style;
			var translate=object.translate || [0,0,0];
			var rotate=object.rotate || [0,0,0];
			var object3d=null;
			if(object.type==='path'){				
				object3d=this.createPathObject(object);
			}
			if(object.type==='cube'){
				object3d=this.createCubeObject(object);
			}			
			if(object3d){
				object3d.setRotation(rotate[0], rotate[1], rotate[2]);
				if(style){
					object3d.s(style);
				}						
				children.push(object3d);
				if(children.length>1){
					ops.push(op);
				}
				ids.push(object3d.getId());
			}
		}

		if(children.length>0){
			var combo=new mono.ComboNode(children, ops);
			combo.setNames(ids);
			return combo;
		}
		return null;
	},

	loadData: function(gl3dview){
		var json= demo.filterJson(gl3dview.getServa(), dataJson.objects);
		var box=gl3dview.getServa();

		gl3dview.setClearColor(demo.CLEAR_COLOR);

		var children=[];
		var ops=[];
		var ids=[];
		var shadowHost;
		var shadowHostId;
		for(var i=0;i<json.length;i++){
			var object=json[i];
			var op=object.op;
			var style=object.style;
			var client=object.client;
			var translate=object.translate || [0,0,0];
			var rotate=object.rotate || [0,0,0];
			var object3d=null;

			if(object.type==='path'){				
				object3d=this.createPathObject(object);
			}
			if(object.type==='cube'){
				object3d=this.createCubeObject(object);				
			}

			if(object.shadowHost){
				shadowHost=object3d;
				shadowHostId=object3d.getId();
				box.shadowHost = shadowHost;
			}

			var creator=demo.getCreator(object.type);
			if(creator){
				creator(box, object);
				continue;
			}

			if(object3d){
				object3d.shadow = object.shadow;
				object3d.setRotation(rotate[0], rotate[1], rotate[2]);
				if(style){
					object3d.s(style);
				}		
				if(client){
					for(var key in client){
						object3d.setClient(key,client[key]);		
					}
				}	
				if(op){
					children.push(object3d);
					if(children.length>1){
						ops.push(op);
					}
					ids.push(object3d.getId());
				}else{						
					box.add(object3d);
				}
			}
		}
		
		if(children.length>0){
			var combo=new mono.ComboNode(children, ops);			
			combo.setNames(ids);
			combo.setClient('type', 'floorCombo');
			box.add(combo);

			//lazy load floor shadow map.
		/*	if(shadowHost && shadowHostId){
				setTimeout(function(){demo.updateShadowMap(combo, shadowHost, shadowHostId,box)}, demo.LAZY_MAX);
			}*/
		}
	},

	updateShadowMap: function(combo, shadowHost, shadowHostId,box){
		var shadowMapImage=demo.createShadowImage(box, shadowHost.getWidth(), shadowHost.getDepth());
		var floorTopFaceId=shadowHostId+'-top.m.lightmap.image';						
		combo.setStyle(floorTopFaceId, shadowMapImage);
	},

	loadRackContent: function(box, x, y, z, width, height, depth, severity, cube, cut, json, parent, oldRack){
		var positionY=10;
		var serverTall=9;
		var serverGap=2;
		var findFaultServer=false;
		while(positionY<height-20){
			var number = parseInt(Math.random()*3)+1;
			var pic='server'+number+'.jpg';
			if(number === 3 ){
				pic='server3.png';
			}
			
			var color= (number === 3 || positionY>100) && !findFaultServer && severity ? severity.color : null;
			var server=this.createServer(box, cube, cut, pic, color, oldRack);

			var size = server.getBizBox().size();
			if(color){
				findFaultServer=true;
			}
			server.setPositionY(positionY + size.y/2 - height/2);
			server.setPositionZ(server.getPositionZ()+5);	
			server.setParent(parent);
			positionY = positionY + size.y + serverGap;
			if(positionY>200){
				box.removeByDescendant(server,true);
				break;
			}

		}
	},

    //创建服务器
	createServer: function(box, cube, cut, pic, color, oldRack){
		var picMap = {
			'server1.jpg': 4.445*2,
			'server2.jpg': 4.445*3,
			'server3.png': 4.445*6,
		}
		var x=cube.getPositionX();
		var z=cube.getPositionZ();
		var width=cut.getWidth();
		var height = picMap[pic];
		var depth=cut.getDepth();

		var serverBody=new mono.Cube(width-2, height-2, depth-4);
		var bodyColor=color?color:'#5B6976';
		serverBody.s({
			'm.color': bodyColor,
			'm.ambient': bodyColor,
			'm.type':'phong',
			'm.texture.image': demo.getRes('rack_inside.jpg'),
		});
		serverBody.setPosition(0, 0.5, (cube.getDepth()-serverBody.getDepth())/2);

		var serverPanel=new mono.Cube(width+2, height+1, 0.5);
		color=color?color:'#FFFFFF';
		serverPanel.s({			
			'm.texture.image': demo.getRes('rack_inside.jpg'),
			'front.m.texture.image': demo.RES_PATH + '/' +pic,
			'front.m.texture.repeat': new mono.XiangliangTwo(1,1),
			'm.specularStrength': 100,
			'm.transparent': true,
			'm.color': color,
			'm.ambient': color,
		});
		serverPanel.setPosition(0, 0, serverBody.getDepth()/2+(cube.getDepth()-serverBody.getDepth())/2);
		if(pic == 'server3.png'){
			var serverColor = '#FFFFFF';
			serverPanel.s({
				'm.color': serverColor,
				'm.ambient': serverColor,
			});
		}

		var server=new mono.ComboNode([serverBody, serverPanel], ['+']);
		server.setClient('animation', 'pullOut.z');
		server.setPosition(0.5, 0, -5);
		box.add(server);

		if(pic == 'server3.png'){
			var isRendered = false;
			var xoffset = 2.1008, yoffset = 0.9897;
			var width = width + 2;
			var height = height +1;
			var cardWidth = (width - xoffset*2)/14;
			var count = 14;

			for(var i = 0; i< count; i++){
				var cardColor = '#FFFFFF';
				if(i > 5 && !isRendered) {
					cardColor = color;
					isRendered = true;
				}
				var params={
					'height': height-yoffset*2, 
					'width': cardWidth, 
					'depth':depth*0.4, 
					'pic': demo.RES_PATH + '/'+ 'card'+(i%4+1) +'.png',
					'color': cardColor
				};
				var card=demo.createCard(params);
				box.add(card);

				card.setParent(server);	
				card.setClient('type','card');	
				card.setClient('BID','card-'+i);	
				card.setClient('isAlarm', cardColor != '#FFFFFF');				
		  		card.p(-width/2 + xoffset + (i+0.5) * cardWidth,-height/2+yoffset,serverPanel.getPositionZ()-1);
		  		card.setClient('animation', 'pullOut.z');

				if(card.getClient('isAlarm')){
					oldRack.alarmCard=card;					
				}
		  	}
		}
		return server;
	},



	findFirstObjectByMouse: function(gl3dview, e){
	    debugger
		var objects = gl3dview.getElementsByMouseEvent(e);
		if (objects.length) {
			for(var i=0;i<objects.length;i++){			
				var first = objects[i];
				var object3d = first.element;
				if(! (object3d instanceof mono.Billboard)){
					return first;
				}
			}
		}
		return null;
	},

	animateGleye: function(gleye, interaction, oldPoint, newPoint, onDone){
		//twaver.Util.stopAllAnimates(true);
		
		var offset=gleye.getPosition().sub(gleye.getTarget());
		var animation=new twaver.Animate({
			from: 0,
			to: 1,
			dur: 500,
			easing: 'easeBoth',
			onUpdate: function (value) {
				var x=oldPoint.x+(newPoint.x-oldPoint.x)*value;
				var y=oldPoint.y+(newPoint.y-oldPoint.y)*value;
				var z=oldPoint.z+(newPoint.z-oldPoint.z)*value;
				var target=new mono.XiangliangThree(x,y,z);				
				gleye.lookAt(target);
				interaction.target=target;
				var position=new mono.XiangliangThree().addVectors(offset, target);
				gleye.setPosition(position);
			},
		});
		animation.onDone=onDone;
		animation.play();
	},
	
	playAnimation: function(element, animation, done){
		var params=animation.split('.');
		if(params[0]==='pullOut'){
			var direction=params[1];
			demo.animatePullOut(element, direction, done);
		}
		if(params[0]==='rotate'){
			var anchor=params[1];
			var angle=params[2];
			var easing=params[3];
			demo.animateRotate(element, anchor, angle, easing, done);
		}		
	},

	animatePullOut: function(object, direction, done){
		//twaver.Util.stopAllAnimates(true);

		var size=object.getBizBox().size().multiply(object.getScale());

		var movement=0.8;
		
		var directionVec=new mono.XiangliangThree(0, 0, 1);
		var distance=0;
		if(direction==='x'){
			directionVec=new mono.XiangliangThree(1, 0, 0);
			distance=size.x;
		}
		if(direction==='-x'){
			directionVec=new mono.XiangliangThree(-1, 0, 0);
			distance=size.x;
		}
		if(direction==='y'){
			directionVec=new mono.XiangliangThree(0, 1, 0);
			distance=size.y;
		}
		if(direction==='-y'){
			directionVec=new mono.XiangliangThree(0, -1, 0);
			distance=size.y;
		}
		if(direction==='z'){
			directionVec=new mono.XiangliangThree(0, 0, 1);
			distance=size.z;
		}
		if(direction==='-z'){
			directionVec=new mono.XiangliangThree(0, 0, -1);
			distance=size.z;
		}

		distance=distance*movement;
		if(object.getClient('animated')){
			directionVec=directionVec.negate();
		}

		var fromPosition=object.getPosition().clone();		
		object.setClient('animated', !object.getClient('animated'));

		new twaver.Animate({
			from: 0,
			to: 1,
			dur: 2000,
			easing: 'bounceOut',			
			onUpdate: function (value) {
				//don't forget to clone new instance before use them!
				object.setPosition(fromPosition.clone().add(directionVec.clone().multiplyScalar(distance * value)));
			},
			onDone: function(){
				demo.animationFinished(object);			

				if(done) {
					done();
				}
			},
		}).play();
	},

	animateRotate: function(object, anchor, angle, easing, done){
		//twaver.Util.stopAllAnimates(true);
		easing = easing || 'easeInStrong';

		var size=object.getBizBox().size().multiply(object.getScale());
		
		var from=0;
		var to=1;
		if(object.getClient('animated')){
			to=-1;
		}
		object.setClient('animated', !object.getClient('animated'));
		
		var position;
		var axis;
		if(anchor==='left'){
			position=new mono.XiangliangThree(-size.x/2, 0, 0);
			var axis=new mono.XiangliangThree(0,1,0);
		}
		if(anchor==='right'){
			position=new mono.XiangliangThree(size.x/2, 0, 0);
			var axis=new mono.XiangliangThree(0,1,0);
		}

		var animation=new twaver.Animate({
			from: from,
			to: to,
			dur: 1500,
			easing: easing,
			onUpdate: function (value) {					
				if(this.lastValue===undefined){
					this.lastValue=0;
				}
				object.rotateFromAxis(axis.clone(), position.clone(), Math.PI/180*angle*(value-this.lastValue));
				this.lastValue=value;
			},
			onDone: function(){
				delete this.lastValue;
				demo.animationFinished(object);

				if(done) {
					done();
				}
			},
		});
		animation.play();
	},
	
	animationFinished: function(element){
		var animationDoneFuc=element.getClient('animation.done.func');
		if(animationDoneFuc){
			animationDoneFuc();
		}
	},

	getRandomInt: function(max){
		return parseInt(Math.random()*max);
	},
	
	getRandomLazyTime: function(){
		var time=demo.LAZY_MAX-demo.LAZY_MIN;
		return demo.getRandomInt(time)+demo.LAZY_MIN;
	},





	/* h, s, v (0 ~ 1) */
	getHSVColor: function (h, s, v) {
		var r, g, b, i, f, p, q, t;
		if (h && s === undefined && v === undefined) {
			s = h.s, v = h.v, h = h.h;
		}
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
		var rgb='#'+this.toHex(r * 255)+this.toHex(g * 255)+this.toHex(b * 255);
		return rgb;
	},

	toHex: function (value){
		var result=parseInt(value).toString(16);
		if(result.length==1){
			result='0'+result;
		}
		return result;
	},
	
	showDialog: function(content, title, width, height,left) {
		title= title || '';
		width=width || 600;
		height=height || 400;
        left=left || 100;
		var div=document.getElementById('dialog');
		if(div){
			document.body.removeChild(div);
		}
		div=document.createElement('div');
		div.setAttribute('id', 'dialog');

		div.style.display = 'block';
		div.style.position = 'absolute';
		div.style.left = left+"px";
		div.style.top = '100px';
		div.style.width=width+'px';
		div.style.height=height+'px';
		div.style.background='rgba(164,186,223,0.75)';						
		div.style['border-radius']='5px';
		document.body.appendChild(div);

		var span=document.createElement('span');
		span.style.display = 'block';
		span.style['color']='white';
		span.style['font-size']='13px';
		span.style.position = 'absolute';
		span.style.left = '10px';
		span.style.top = '2px';
		span.innerHTML=title;
		div.appendChild(span);

		var img=document.createElement('img');
		img.style.position = 'absolute';
		img.style.right= '4px';
		img.style.top = '4px';
		img.setAttribute('src', demo.getRes('close.png'));
		img.onclick = function () {
			document.body.removeChild(div);
		};
		div.appendChild(img);

		if(content){
			content.style.display = 'block';
			content.style.position = 'absolute';
			content.style.left = '3px';
			content.style.top = '24px';
			content.style.width=(width-6)+'px';
			content.style.height=(height-26)+'px';
			div.appendChild(content);
		}
	},

    showServerDialog: function(title){
        var span=document.createElement('span');
        span.style['background-color']='rgba(255,255,255,0.85)';
        span.style['padding']='10px';
        span.style['left']='400px';
        span.style['color']='darkslategrey';
        span.innerHTML='<b>详细描述</b>'+
            '<p>科大国创 办公楼3楼 308 室 编号001 服务器'+
            '主要部署XX项目，XX项目</p>';
        demo.showDialog(span, '编号001服务器', 300, 150,500);
        span.style['width']='275px';
        span.style['height']='100px';
    },

    showAlarmDialog: function(){
        var span=document.createElement('span');
        span.style['background-color']='rgba(255,255,255,0.85)';
        span.style['padding']='10px';
        span.style['color']='darkslategrey';
        span.innerHTML='<b>告警描述</b>'+
            '<p>中兴S330板卡有EPE1，LP1，OL16，CSB,SC，EPE1（2M电口）与LP1（155M光）与用户路由器连接。'+
            'EPE1上发生TU-AIS ,TU-LOP，UNEQ，误码秒告警，所配业务均出现，用户路由器上出现频繁up，down告警。'+
            '用户路由器上与1块LP1（有vc12级别的交叉）连接的cpos板卡上也有频繁up，down告警，与另一块LP1（vc4穿通）'+
            '连接的cpos卡上无告警</p>'+
            '<b>故障分析</b>'+
            '<p>情况很多。如果只是单站出现，首先判断所属环上保护，主用光路有没有告警；如果有，解决主用线路问题；'+
            '如果没有，做交叉板主备切换--当然是在晚上进行；很少出现主备交叉板都坏的情况。'+
            '还没解决的话，依次检查单板和接口板。</p>';

        demo.showDialog(span, 'SDH 2M支路板告警', 510, 250);
        span.style['width']='484px';
        span.style['height']='203px';
    },
	showVideoDialog: function(title){
		var video=document.createElement('video');		
		video.setAttribute('src', demo.getRes('test.mp4'));
		video.setAttribute('controls', 'true');
		video.setAttribute('autoplay', 'true');			
		
		demo.showDialog(video, title, 610, 280,100);
	},




	resetView: function(gl3dview){		
		demo.resetGleye(gl3dview);

		//reset all racks. unload contents, close door.
		var loadedRacks=[];
		gl3dview.getServa().forEach(function(element){
			if(element.getClient('type')==='rack' && element.oldRack){
				loadedRacks.push(element);
			}
		});
		for(var i=0;i<loadedRacks.length;i++){
			//restore the old rack.
			var newRack=loadedRacks[i];
			var oldRack=newRack.oldRack;

			if(newRack.alarm){
				gl3dview.getServa().getAlarmBox().remove(newRack.alarm);
			}
			gl3dview.getServa().removeByDescendant(newRack,true);

			gl3dview.getServa().add(oldRack);
			if(oldRack.alarm){
				gl3dview.getServa().getAlarmBox().add(oldRack.alarm);
			}
			oldRack.door.setParent(oldRack);
			oldRack.setClient('loaded', false);
			
			//reset door.
			var door=oldRack.door;
			gl3dview.getServa().add(door);
			if(door.getClient('animated')){
				demo.playAnimation(door, door.getClient('animation'));
			}
		}

		//reset room door.
		var doors=[];
		gl3dview.getServa().forEach(function(element){
			if(element.getClient('type')==='left-door' || element.getClient('type')==='right-door'){
				doors.push(element);
			}
		});
		for(var i=0;i<doors.length;i++){
			var door=doors[i];
			if(door.getClient('animated')){
				demo.playAnimation(door, door.getClient('animation'));
			}
		}

		//reset all views.
		/*if(gl3dview.temperatureView){
			demo.toggleTemperatureView(gl3dview);
		}*/
		/*if(gl3dview.spaceView){
			demo.toggleSpaceView(gl3dview);
		}*/
		/*if(gl3dview.usageView){
			demo.toggleUsageView(gl3dview);
		}*/
		/*if(gl3dview.airView){
			demo.toggleAirView(gl3dview);
		}*/
		/*if(gl3dview.moveView){
			demo.toggleMoveView(gl3dview);
		}*/
	   /*if(gl3dview.connectionView){
			demo.toggleConnectionView(gl3dview);
		}*/
		/*if(gl3dview.smokeView){
			demo.toggleSmokeView(gl3dview);
		}*/
		/*if(gl3dview.waterView){
			demo.toggleWaterView(gl3dview);
		}*/
		/*if(gl3dview.laserView){
			demo.toggleLaserView(gl3dview);
		}*/
		/*if(gl3dview.powerView){
			demo.togglePowerView(gl3dview);
		}*/
	},

resetRackPosition: function(gl3dview){
		//reset all rack position
		gl3dview.getServa().forEach(function(element){
			if(element.getClient('type')==='rack'){
				element.setPosition(element.getClient('origin'));
			}
		});
		demo.dirtyShadowMap(gl3dview);
	},

	showDoorTable: function(){
		var table=document.createElement('table');
		table.setAttribute('class', 'gridtable');
		for(var k=0;k<8;k++){
			var tr=document.createElement('tr');
			table.appendChild(tr);
			for(var i=0;i<3;i++){
				var tagName= k==0 ? 'th' : 'td';
				var td=document.createElement(tagName);
				tr.appendChild(td);
				if(k==0){
					if(i==0){
						td.innerHTML='#';
					}
					if(i==1){
						td.innerHTML='Time';
					}
					if(i==2){
						td.innerHTML='Activity';
					}
				}else{
					if(i==0){
						td.innerHTML=parseInt(Math.random()*1000);
					}
					if(i==1){
						td.innerHTML=new Date().format('yyyy h:mm');
					}
					if(i==2){
						if(Math.random()>0.5){
							td.innerHTML='Door access allowed';
						}else{
							td.innerHTML='Instant Alart - Door access denied';
						}
					}
				}
			}
		}

		demo.showDialog(table, 'Door Security Records', 330, 240);
	},











}
demo.registerFilter('floor', function(box, json){
	return {
		type: 'cube',
		width: 1000,
		height: 10,
		depth: 1000,
		translate: [0, -10, 0],
		shadowHost: true,
		op: '+',
		style: {
			'm.type': 'phong',
			'm.color': '#BEC9BE',
			'm.ambient': '#BEC9BE',
			'top.m.type':'basic',
			'top.m.texture.image': demo.getRes('floor.jpg'),
			'top.m.texture.repeat': new mono.XiangliangTwo(10,10),
			'top.m.color': '#DAF0F5',
			'top.m.polygonOffset':true,
			'top.m.polygonOffsetFactor':3,
			'top.m.polygonOffsetUnits':3,
		}
	};
});

demo.registerFilter('floor_cut', function(box, json){
	return {
		type: 'cube',
		width: 100,
		height: 100,
		depth: 100,
		op: '-',
		style: {
			'm.texture.image': demo.getRes('floor.jpg'),
			'm.texture.repeat': new mono.XiangliangTwo(4,4),
			'm.color': '#DAF0F5',
			'm.lightmap.image': demo.getRes('outside_lightmap.jpg'),
			'm.polygonOffset':true,
			'm.polygonOffsetFactor':3,
			'm.polygonOffsetUnits':3,
		}
	};
});

demo.registerFilter('floor_box', function(box, json){
	return {
		type: 'cube',
		width: 100,
		height: 100,
		depth: 100,
		shadow: true,
		sideColor: '#C3D5EE',
		topColor: '#D6E4EC',
		client: {
			type: 'floor_box'
		}
	};
});


//货架
demo.registerFilter('racks', function(box, json){
	var objects=[];
	var translates=json.translates;
	var severities=json.severities || [];
	var labels=json.labels || [];
	console.log(translates+";"+severities+";"+labels);
	if(translates){
		for(var i=0;i<translates.length;i++){
			var translate=translates[i];
			var severity=severities[i];
			var label=labels[i] || '';
			var rack={
				type: 'rack',
				shadow: true,
				translate: translate,
				severity: severity,
				label: label,
			};
			demo.copyProperties(json, rack, ['type', 'translates', 'translate', 'severities']);
			objects.push(rack);
		}
	}
	return objects;
});

demo.registerFilter('wall', function(box, json){	
	var objects=[];

	var wall = {
		type: 'path',
		op: '+',
		width: 20,
		height: 200,
		shadow: true,
		insideColor: '#B8CAD5',
		outsideColor: '#A5BDDD',		
		topColor: '#D6E4EC',
		translate: json.translate,
		data:json.data,

		client: {
			'data': json.data,
			'type': 'wall',
			'translate': json.translate,
		},
	};
			
	objects.push(wall);		

	if(json.children){	
		var children=demo.filterJson(box, json.children);				
		objects=objects.concat(children);	
	}

	var comboChildren=[];
	var returnObjects=[];
	for(var i=0;i<objects.length;i++){
		var child=objects[i];
		if(child.op){
			comboChildren.push(child);
		}else{
			returnObjects.push(child);
		}
	}
	
	var comboWall = demo.createCombo(comboChildren);
	comboWall.shadow = true;
	comboWall.setClient('data', json.data);
	comboWall.setClient('type','wall');
	comboWall.setClient('translate',json.translate);
	box.add(comboWall);

	return returnObjects;
});

demo.registerFilter('window', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width || 100,
		height=json.height || 100,
		depth=json.depth || 50;
	var glassDepth=2;
	var platformHeight=5,
		platformDepth=45,
		platformOffsetZ=10;

	return [{
		// window cut off
		type: 'cube',
		width: width,
		height: height,
		depth: depth, 
		translate: [x, y, z],
		op: '-',
		sideColor: '#B8CAD5',
		topColor: '#D6E4EC',		
		
	},{
		//window glass
		type: 'cube',
		width: width-0.5,
		height: height-0.5,
		depth: glassDepth,
		translate: [x, y, z],
		op: '+',
		style: {			
			'm.color':'#58ACFA',
			'm.ambient':'#58ACFA',
			'm.type':'phong',
			'm.specularStrength': 0.1,
			'm.envmap.image': demo.getEnvMap(),
			'm.specularmap.image': demo.getRes('rack_inside_normal.jpg'),	
			'm.texture.repeat': new mono.XiangliangTwo(10,5),
			'front.m.transparent': true,
			'front.m.opacity':0.4,
			'back.m.transparent': true,
			'back.m.opacity':0.4,
		},			
	},{
		//window bottom platform.
		type: 'cube',
		width: width,
		height: platformHeight,
		depth: platformDepth, 
		translate: [x, y, z+platformOffsetZ],
		op: '+',
		sideColor: '#A5BDDD',
		topColor: '#D6E4EC',
	}];
});

demo.registerFilter('door', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width || 205,
		height=json.height || 180,
		depth=json.depth || 26;	
	var frameEdge=10,
		frameBottomEdge=2;

	return [{
		//door frame.
		type: 'cube',
		width: width,
		height: height,
		depth: depth,
		translate: [x, y, z],
		op: '+',
		sideColor: '#C3D5EE',
		topColor: '#D6E4EC',
	},{
		//door cut off.
		type: 'cube',
		width: width-frameEdge,
		height: height-frameEdge/2-frameBottomEdge,
		depth: depth+2,
		op: '-',
		translate:[x,y+frameBottomEdge,z],
		sideColor: '#B8CAD5',
		topColor: '#D6E4EC',			
	},{
		//left door.
		type: 'cube',
		width: (width-frameEdge)/2-2,
		height: height-frameEdge/2-frameBottomEdge-2,
		depth: 2,
		translate:[x-(width-frameEdge)/4,frameBottomEdge+1,z],
		sideColor: 'orange',
		topColor: 'orange',
		style:{
			'm.type': 'phong',
			'm.transparent': true,
			'front.m.texture.image': demo.getRes('door_left.png'),					
			'back.m.texture.image': demo.getRes('door_right.png'),					
			'm.specularStrength': 100,
			'm.envmap.image': demo.getEnvMap(),
			'm.specularmap.image': demo.getRes('white.png'),	
		},
		client:{
			'animation': 'rotate.left.-90.bounceOut',
			'type': 'left-door',
		},
	},{
		//right door.
		type: 'cube',
		width: (width-frameEdge)/2-2,
		height: height-frameEdge/2-frameBottomEdge-2,
		depth: 2,
		translate:[x+(width-frameEdge)/4,frameBottomEdge+1,z],
		sideColor: 'orange',
		topColor: 'orange',
		style:{
			'm.type': 'phong',
			'm.transparent': true,
			'front.m.texture.image': demo.getRes('door_right.png'),					
			'back.m.texture.image': demo.getRes('door_left.png'),					
			'm.specularStrength': 100,
			'm.envmap.image': demo.getEnvMap(),
			'm.specularmap.image': demo.getRes('white.png'),	
		},		
		client:{
			'animation': 'rotate.right.90.bounceOut',
			'type': 'right-door',
		},
	},{
		//door control.
		type: 'cube',
		width: 15,
		height: 32,
		depth: depth-3,
		translate: [x-width/2-13, height*0.6, z],
		style:{
			'left.m.visible': false,
			'right.m.visible': false,
			'top.m.visible': false,
			'bottom.m.visible': false,
			'm.transparent': true,
			'm.specularStrength': 50,
			'front.m.texture.image': demo.getRes('lock.png'),
			'back.m.texture.image': demo.getRes('lock.png'),
		},
		client:{
			'dbl.func': demo.showDoorTable,
			'type': 'door_lock',
		},
	}];
});











demo.registerShadowPainter('wall', function(object, context, floorWidth, floorHeight, translate, rotate){
	var translate = object.getClient('translate') || [0, 0, 0];		
	var translateX=floorWidth/2+translate[0];
	var translateY=floorHeight-(floorHeight/2+translate[2]);
	var pathData=object.getClient('data');			
	
	context.save();
	context.translate(translateX, translateY);
	context.rotate(rotate);
	context.beginPath();
	var first=true;
	for(var j=0;j<pathData.length;j++){
		var point=pathData[j];
		if(first){
			context.moveTo(point[0], -point[1]);
			first=false;
		}else{
			context.lineTo(point[0], -point[1]);
		}
	}

	context.lineWidth = object.getClient('width') || 20;		

	context.strokeStyle = 'white';
	context.shadowColor = '#222222';
	context.shadowBlur = 60;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.stroke();
	
	context.restore();
});



demo.registerShadowPainter('rack', function(object, context, floorWidth, floorHeight, translate, rotate){
	var translateX=floorWidth/2+translate.x;
	var translateY=floorHeight/2+translate.z;
	var width=object.width || 60;
	var height=object.height || 200;
	var depth=object.depth || 80;
	var width=width*0.99;
	var lineWidth=depth*0.99;

	context.save();

	context.beginPath();
	context.moveTo(translateX-width/2, translateY);
	context.lineTo(translateX+width/2, translateY);
	
	context.lineWidth = lineWidth;
	context.strokeStyle = 'gray';
	context.shadowColor = 'black';
	context.shadowBlur = 100;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;						
	context.stroke();			
	
	context.restore();
});

demo.createRoundShadowPainter=function(radius){
	return function(object, context, floorWidth, floorHeight, translate, rotate){
		var translateX=floorWidth/2+translate.x;
		var translateY=floorHeight/2+translate.z;

		context.save();

		context.beginPath();
		context.arc(translateX, translateY, radius, 0, 2 * Math.PI, false);
		
		context.fillStyle='black';
		context.shadowColor = 'black';
		context.shadowBlur = 25;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;						
		context.fill();			

		context.restore();
	}
};





demo.registerCreator('rack', function(box, json){
	var translate=json.translate || [0,0,0];
	var x=translate[0],
		y=translate[1],
		z=translate[2];
	var width=json.width || 60;
	var height=json.height || 200;
	var depth=json.depth || 80;
	var severity=json.severity;
	var label=json.label;
	var shadow = json.shadow;

	var rack= new mono.Cube(width, height, depth);
	rack.s({				
		'm.color': '#557E7A',
		'left.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'right.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'front.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'back.m.lightmap.image':demo.getRes('outside_lightmap.jpg'),
		'top.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'left.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'right.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'back.m.normalmap.image':demo.getRes('metal_normalmap.jpg'),
		'top.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'left.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'right.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'back.m.specularmap.image': demo.getRes('outside_lightmap.jpg'),	
		'top.m.envmap.image': demo.getEnvMap(),
		'left.m.envmap.image': demo.getEnvMap(),
		'right.m.envmap.image': demo.getEnvMap(),
		'back.m.envmap.image': demo.getEnvMap(),
		'm.ambient': '#557E7A',
		'm.type':'phong',
		'm.specularStrength': 50,
		'front.m.texture.image':demo.getRes('rack.jpg'),
		'front.m.texture.repeat': new mono.XiangliangTwo(1,1),
		'front.m.specularmap.image':demo.getRes('white.png'),
		'front.m.color':'#666',
		'front.m.ambient':'#666',
		'front.m.specularStrength': 200,
	});
	rack.setPosition(x, height/2+1+y, z);
	rack.setClient('ser.func',function(){
        //点击服务器图标，弹框
        demo.showServerDialog();
    });


	//机门柜，双击开门
	var rackDoor = new mono.Cube(width, height, 2);
	rackDoor.s({
		'm.type':'phong',
		'm.color': '#A5F1B5',
		'm.ambient': '#A4F4EC',
		'front.m.texture.image': demo.getRes('rack_front_door.jpg'),
		'back.m.texture.image': demo.getRes('rack_door_back.jpg'),
		'm.envmap.image': demo.getEnvMap(),
	});
	rackDoor.setParent(rack);//机柜门的父类是机柜
	rack.door=rackDoor;
	rackDoor.setPosition(0, 0, depth/2+1); 
	rackDoor.setClient('animation','rotate.right.100');//双击机柜门，出现动画，柜门向右旋转100
	rackDoor.setClient('type', 'rack.door');
	rackDoor.setClient('animation.done.func', function(){
        //点击服务器的的门图标时，触发弹框
        demo.showServerDialog();
		if(rack.getClient('loaded') || !rackDoor.getClient('animated')){
			return;
		}
		var fake=rack.clone();
		fake.s({
			'm.color': 'red',
			'm.ambient': 'red',
			'm.texture.image': null,
			'top.m.normalmap.image': demo.getRes('outside_lightmap.jpg'),
			'top.m.specularmap.image': demo.getRes('white.png'),
		});
		fake.setDepth(fake.getDepth()-2);
		fake.setWidth(fake.getWidth()-2);
		box.add(fake);

		rack.s({
			'm.transparent': true,
			'm.opacity': 0.5,
		});

		new twaver.Animate({
			from: 0,
			to: fake.getHeight(),
			dur: 2000,
			easing: 'easeOut',
			onUpdate: function (value) {
				fake.setHeight(value);
				fake.setPositionY(value/2);
			},
			onDone: function(){
				box.remove(fake);
				rack.s({
					'm.transparent': false,
					'm.opacity': 1,
				});
				var loader = rack.getClient('rack.loader');
				if(loader && rackDoor.getClient('animated') && !rack.getClient('loaded')){
					loader();
					rack.setClient('loaded', true);

					if(rack.getClient('loaded.func')){
						rack.getClient('loaded.func')(rack);
					}
				}
			}
		}).play();
	});

	var loader=function(box, width, height, depth, severity, rack, json){
		var cut=new mono.Cube(width*0.75, height-10, depth*0.7);
		cut.s({
			'm.color': '#333333',
			'm.ambient': '#333333',
			'm.lightmap.image': demo.getRes('inside_lightmap.jpg'),
			'bottom.m.texture.repeat': new mono.XiangliangTwo(2,2),			
			'left.m.texture.image': demo.getRes('rack_panel.jpg'),
			'right.m.texture.image': demo.getRes('rack_panel.jpg'),
			'back.m.texture.image': demo.getRes('rack_panel.jpg'),
			'back.m.texture.repeat': new mono.XiangliangTwo(1,1),
			'top.m.lightmap.image': demo.getRes('floor.jpg'),
		});
		cut.setPosition(0, 0, depth/2-cut.getDepth()/2+1);
		box.remove(rack);
		if(rack.alarm){
			box.getAlarmBox().remove(rack.alarm);
		}

		var cube = rack.clone();
		cube.p(0, 0, 0);
		
		var newRack=new mono.ComboNode([cube, cut], ['-']);
		
		var x=rack.getPosition().x;
		var y=rack.getPosition().y;
		var z=rack.getPosition().z;

		newRack.p(x, y, z);
		newRack.setClient('type', 'rack');
		newRack.oldRack=rack;
		rack.newRack=newRack;
		newRack.shadow = shadow;
		box.add(newRack);

		if(severity){
			var alarm = new mono.Alarm(newRack.getId(), newRack.getId(), severity);
			newRack.setStyle('alarm.billboard.vertical', true);
			newRack.alarm=alarm;
			box.getAlarmBox().add(alarm);
		}

		//set child for newrack
		var children = rack.getChildren();
		children.forEach(function(child){
			if(child && !(child instanceof mono.Billboard)){
				child.setParent(newRack);
			}
		});

		demo.loadRackContent(box, x, y, z, width, height, depth, severity, cube, cut, json, newRack, rack);		
	};

	box.add(rack);
	box.add(rackDoor);
	if(severity){
		var alarm = new mono.Alarm(rack.getId(), rack.getId(), severity);
		rack.setStyle('alarm.billboard.vertical', true);
		rack.alarm=alarm;
		box.getAlarmBox().add(alarm);
	}			
	var loadFunction = function(){
		loader(box, width, height, depth, severity, rack, json);
	};
	rack.setClient('rack.loader', loadFunction);
});



demo.registerFilter('gleye', function(box, json){
	var x=json.translate[0], y=json.translate[1], z=json.translate[2];
   /* var x=80, y=200, z=30,angle=0;*/
	var angle=json.angle || 0;
	var direction=130;
    console.log(x+","+y+","+z+","+angle);
	var loader=function(box, x, y, z, angle, direction){		
		var gleye=demo.createGleye(box, x, y, z, angle, direction);
		box.add(gleye);
	}

	var loaderFunc=function(box, x, y, z, angle, direction){		
		return function(){
			loader(box, x, y, z, angle, direction);
		}
	}
	setTimeout(loaderFunc(box, x, y, z, angle, direction), demo.getRandomLazyTime());					
});

demo.createGleye=function(box, x, y, z, angle, direction){		
	var body=new mono.Cylinder(4,4,15);
	body.s({
		'm.texture.image': demo.getRes('bbb.png'),
		'top.m.texture.image': demo.getRes('camera.png'),
		'bottom.m.texture.image': demo.getRes('eee.png'),
		'm.type': 'phong',
	});
	
	var style={
		'side.m.normalType': mono.NormalTypeSmooth,
	};
	var cover1=new mono.Cylinder(6,6,20);
	cover1.s(style);
	var cover2=new mono.Cylinder(5,5,20);
	cover2.s(style);
	var cover3=new mono.Cube(10,20,10);
	var path=new mono.Path();
	path.moveTo(0,0,0);
	path.lineTo(0,-10,0);
	path.lineTo(0,-11,-10);
	path.lineTo(0,-12,-13);
	path.lineTo(0,-12,-30);
	
	var gleye=new mono.ComboNode([cover1,cover3,cover2, body],['+','-','+']);
	gleye.s({
		'm.type': 'phong',
		'm.color': '#2E2E2E',
		'm.ambient': '#2E2E2E',
		'm.specularStrength': 50,
	});
	gleye.setRotation(Math.PI/180*100, 0, Math.PI/180*angle);
	gleye.setPosition(x,y,z);		
	gleye.setClient('type', 'gleye');
	gleye.setClient('dbl.func', function(){
		demo.showVideoDialog('Gleye #: C300-493A  |  Status: OK');
	});
	box.add(gleye);

	var pipe=new mono.PathNode(path,10,2,10,'plain','plain');
	pipe.s({
		'm.color': '#2E2E2E',
		'm.ambient': '#2E2E2E',
		'm.type': 'phong',
		'm.specularStrength': 50,
		'm.normalType': mono.NormalTypeSmooth,
	});
	pipe.setRotationX(-Math.PI/2);		
	pipe.setParent(gleye);
	
	box.add(pipe);
};

demo.createWall = function(path, thick, height, insideColor, outsideColor, topColor){
	var wall= new mono.PathCube(path, thick, height);
	wall.s({
		'outside.m.color': outsideColor,
		'inside.m.type': 'basic',
		'inside.m.color': insideColor,
		'aside.m.color': outsideColor,
		'zside.m.color': outsideColor,
		'top.m.color': topColor,
		'bottom.m.color': topColor,
		'inside.m.lightmap.image': demo.getRes('inside_lightmap.jpg'),
		'outside.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
		'aside.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
		'zside.m.lightmap.image': demo.getRes('outside_lightmap.jpg'),
	});
	return wall;
}

Tooltip = function(keys, values) {
    this.mainContent = document.createElement('div');
    this.keys = keys;
    this.values = values;
    this.init();
}

twaver.Util.ext('Tooltip', Object, {
	init: function(){
		this.mainContent.setAttribute('class', 'tooltip');
		this.mainContent.setAttribute('id', 'tooltip');
		this.table = document.createElement('table');
		for(var i = 0; i < this.keys.length; i++){
			var tr = document.createElement('tr');
			var tdKey = document.createElement('td');
			tdKey.setAttribute('class', 'tooltip-key');
			tdKey.innerHTML = this.keys[i];
			tr.appendChild(tdKey);

			var tdValue = document.createElement('td');
			tdValue.setAttribute('class', 'tooltip-value');
			tdValue.innerHTML = this.values[i];
			tr.appendChild(tdValue);
			this.table.appendChild(tr);
		}
		this.mainContent.appendChild(this.table);
	},
	getView: function(){
		return this.mainContent;
	},
	setValues: function(values){
		this.values = values;
		var children = this.table.childNodes;
		for(var i = 0; i < this.values.length; i++){
			var value = this.values[i];
			var childGroup = children[i];
			childGroup.lastChild.innerHTML = value;
		}
	}
});

var dataJson={	
	objects: [{
		type: 'floor',
		width: 1600,
		depth: 1300,
	},{
		type: 'floor_cut',
		width: 200,
		height: 20,
		depth: 260,
		translate: [-348,0,530],//位置
		rotate: [Math.PI/180*3, 0, 0],//旋转角度
	},{
		type: 'floor_box',
		width: 300,
		height: 50,
		depth: 100,
		translate: [350, 0, -500],	//走廊板凳
	},{
		type: 'wall',
		height: 200,		
		translate: [-500, 0, -500],
		data:[[0, 0], [1000, 0], [1000, 500], [500, 500], [500, 1000], [0, 1000], [0,0]],
		children: [{
			type: 'window',//窗户
			translate: [200, 30, 500],
			width: 420,
			height: 150,
			depth: 50, 
		},{
			type: 'door',//门
			width: 205,
			height: 180,
			depth: 26,
			translate: [-350, 0, 500],
		}],
	},{
		type: 'plants',//植物
		shadow: true,
		translates: [[560, 0, 400],[560, 0, 0],[60, 0, -100],[60, 0, -400],[-560, 0, 400],[-560, 0, 0],[-560, 0, -400]],
	},{
		type: 'plants',	//窗台上的植物
		scale: [0.5, 0.3, 0.5],
		shadow: false,
		translates: [[100, 27, 520],[300, 27, 520]],
	},{
		type: 'glass_wall',
		width: 1300,
		rotate: [0, Math.PI/180*90, 0],
		translate: [-790, 0, 0],
	},{
		type: 'glass_wall',
		width: 1300,
		rotate: [0, Math.PI/180*90, 0],
		translate: [790, 0, 0],	
	},{
		type: 'racks',	//机柜
		translates: [
			[150, 0, 250],
		/*	[-150-62, 0, 250],*/
			/*[-150-62-62, 0, 250],
			[-370, 0, -250],
			[-370+62, 0, -250],
			[-370+62+62, 0, -250],
			[-370+62+62+62, 0, -250],
			[150, 0, 250],
			[150+62, 0, 250],
			[150+62+62, 0, 250],
			[150+62+62+62, 0, 250],
			[150+62+62+62+62, 0, 250],
			[150-62, 0, 250],
			[150-62-62, 0, 250],	*/		
		],
		labels: (function(){
			var labels=[];
			for(var k=0; k<14; k++){
				var label = '1A';
				if(k < 10){
 					label += '0';
				}
				labels.push(label + k);
			}
			return labels;
		})(),
		severities: [null, null,null,mono.AlarmSeverity.WARNING,mono.AlarmSeverity.CRITICAL,null, mono.AlarmSeverity.MINOR, mono.AlarmSeverity.WARNING,mono.AlarmSeverity.WARNING,null,mono.AlarmSeverity.MINOR],
	},{
		type: 'tv',
		translate: [-130, 100, 513],	
	},{
		type: 'post',
		translate: [80, 110, 10],	
		width: 70,
		height: 120,
		pic: demo.getRes('post.jpg'),
	},{
		type: 'rail',
		data:[ [-180, 250], [-400, 250], [-400, -250], [400, -250]],
	},{
		type: 'connection',
		color: '#ED5A00',
		y: 265,
		flow: 0.05,
		data:[
			[-180, -100, -250],
			[-180, -100, -150],
			[-180, -50, -150],
			[-180, -50, -250],
			[-180, 0, -250],
			[-400, 0, -250],
			[-400, 0, 250],
			[400, 0, 250],
			[400, -50, 250],
			[400, -50, 350],
			[400, -100, 350],
			[400, -100, 250],
		],
	},{
		type: 'connection',
		color: '#21CD43',
		y: 265,
		flow: -0.05,
		data:[
			[-180+3, -100, -250],
			[-180+3, -100, -150],
			[-180+3, -50, -150],
			[-180+3, -50, -250+3],
			[-180+3, 0, -250+3],
			[-400+3, 0, -250+3],
			[-400+3, 0, 250-3],
			[400+3, 0, 250-3],
			[400+3, -50, 250-3],
			[400+3, -50, 350],
			[400+3, -100, 350],
			[400+3, -100, 250],
		],
	},{
		type: 'gleye',
		translate: [80, 200, 30],
	},{
		type: 'gleye',
		translate: [-150, 200, 470],
		angle: 180,
	},{
        type: 'gleye',
        translate: [470, 200, 400],
        angle: 90,
    },{
		type: 'gleye',
		translate: [-450, 200, -470],
		alarm: mono.AlarmSeverity.WARNING,
	},{
		type: 'extinguisher',
		translate: [-45, -470],
	},{
		type: 'extinguisher',
		translate: [-45, -450],		
		arrow: true,
	},{
		type: 'extinguisher',
		translate: [-45, -430],
	},{
		type: 'smoke',
		translate: [300, 180, 240],
		color: '#FAAC58',
	},{
		type: 'smoke',
		translate: [-300, 180, -240],
		color: '#B40431',
	},{
		type: 'water_cable',
		color: '#B45F04',
		y: 10,
		size: 3,
		data:[
			[50, 0, 50],
			[460, 0, 50],
			[460, 0, 450],
			[-460, 0, 450],
			[-460, 0, -450],
			[-100, 0, -450],
			[-50, 0, -400],
			[-50, 0, 0],
			[0, 0, 50],
			[50, 0, 50],
		],
		},{
		type: 'water_cable',
		color: '#04B431',
		y: 10,
		size: 3,
		data:[
			[-300, 0, 180],
			[440, 0, 180],
			[440, 0, 330],
			[-340, 0, 330],
			[-340, 0, -180],
			[-420, 0, -180],
			[-420, 0, -310],
			[-120, 0, -310],
			[-120, 0, -180],
			[-320, 0, -180],
		],
	},{
		type: 'laser',
		from: [-485, 330],
		to: [485, 330],
	},{
		type: 'laser',
		from: [-485, 0],
		to: [-20, 0],
	},{
		type: 'laser',
		from: [-80, 480],
		to: [-80, -480],
	}],
};