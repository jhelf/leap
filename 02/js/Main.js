World = function(){
	this.renderer;
	this.camera;
	this.scene;

	this.buffer1 = [];
	this.buffer2 = [];

	this.res = 71;
	this.size = 4000;

	this.surfaceVerts;

	this.offset_x = 0;

	this.surface;
	this.surface2;

	//Leap variables
    this.leapTimeOut;
    this.isLeapConnected = false;
};

World.prototype = {
	init:function(){
		var that = this;

		this.renderer                    = new THREE.WebGLRenderer();
        this.camera                      = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        this.scene                       = new THREE.Scene();

        this.scene.fog = new THREE.FogExp2( 0x000000, 0.0003 );
            
		this.camera.position.z = 1000;
		this.camera.position.y = 250;
			
		this.camera.lookAt(new THREE.Vector3());
            
        // start the renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("container").appendChild(this.renderer.domElement);

        this.createObjects();

        // set up a request for a render
        requestAnimationFrame($.proxy(this.render,this));

        window.addEventListener( 'resize', $.proxy(this.onWindowResized,this), false );

        this.initLeap();

        //Init fullscreen
        $('#fullscreen').click(function(){
        	if(!that.isFullscreen){
	        	//go fullscreen if possible
		        if (fullScreenApi.supportsFullScreen) {
			        fullScreenApi.requestFullScreen($('#wrapper')[0]);
			        that.isFullscreen = true;
			    }
			}
			else{
				if (fullScreenApi.supportsFullScreen && fullScreenApi.isFullScreen) {
			       	fullScreenApi.cancelFullScreen($('#wrapper')[0]);
			       	that.isFullscreen = false;
			    }
			}
        });
	},

	createObjects:function(){
		var that = this;

		var plane = new THREE.PlaneGeometry(this.size, this.size, this.res-1, this.res-1);

		var material = new THREE.MeshLambertMaterial({color: 0x222222, wireframe:false,shading: THREE.FlatShading});
		var material2 = new THREE.MeshPhongMaterial({color: 0x0090ff, wireframe:true,shading: THREE.FlatShading,opacity:0.8});
		
        this.surface                 = new THREE.Mesh(plane, material);
		this.surface.position.y      = -150;
        this.surface.rotation.x      = -90/180 * Math.PI;
        this.surface.geometry.dynamic = true;
        this.scene.add(this.surface);

        this.surface2                 = new THREE.Mesh(plane, material2);
		this.surface2.position.y      = -149.5;
        this.surface2.rotation.x      = -90/180 * Math.PI;
        this.surface2.geometry.dynamic = true;
        this.scene.add(this.surface2);

        this.surfaceVerts = this.surface.geometry.vertices;

        var v = this.surfaceVerts.length;

        while(v--) {
            var vertex    = that.surfaceVerts[v];
			vertex.origin = vertex.position.clone();
			
			that.buffer1.push(0);
			that.buffer2.push(0);
		}
		
		var light = new THREE.PointLight(0xFFFFFF, 1);
		light.position.y = 100;
		light.position.x = 0;
		this.scene.add(light);
	},

	initLeap:function(){
		var that = this;

		this.leapTimeOut = setTimeout(function(){
			if(!that.isLeapConnected){
				//Leap Device is not connected, show Error message
				$('#noleap').css('opacity','1');
			}
		},2000);

		Leap.loop({},function(frame){

			if(!that.isLeapConnected){
				clearTimeout(that.leapTimeOut);
				that.isLeapConnected = true;
				$('#noleap').css('opacity','0');
			}

			//Detect pointables
			if (frame.pointables.length > 0) {
			    for (var i = 0; i < frame.pointables.length; i++) {
			    	var pointable = frame.pointables[i];
			    	if (pointable.tool) {

			    	}
			    	else{
			    		that.makeRipple((pointable.tipPosition[0]+300)*6.5,(pointable.tipPosition[2]+300)*5,pointable.tipPosition[1]);
			    	}
			    }
			}
		});
			
	},

	makeRipple:function(x,y,depth){

		if(depth<300){
			var xVal    = Math.floor((x / this.size) * (this.res-1));
	        var yVal    = Math.floor((y / this.size) * (this.res-1));

			var index       = (yVal * this.res) + xVal;
			var l = this.surfaceVerts.length;
			this.buffer1[ index ] = -(300-depth)*40;
				
			if ( index % this.res == 0 ) {
				this.buffer1[ index + 1 ] = -(300-depth)*15;
			} else if ( index % this.res == this.res - 1 ) {
				this.buffer1[ index - 1 ] = -(300-depth)*15;
			} else {
				this.buffer1[ index - 1 ] = -(300-depth)*15;
				this.buffer1[ index + 1 ] = -(300-depth)*15;
			}
			if ( index < this.res ) {
				this.buffer1[ index + this.res ] = -(300-depth)*15;
			} else if ( index > l - this.res - 1 ) {
				this.buffer1[ index - this.res ] = -(300-depth)*15;
			} else {
				this.buffer1[ index - this.res ] = -(300-depth)*15;
				this.buffer1[ index + this.res ] = -(300-depth)*15;
			}
		}
	},

	render:function(){
		var that = this;

		//Render
		if(this.renderer){
			this.renderer.render(this.scene, this.camera);
		}

		var data = this.generateNoise(this.res,this.res);
        var v = this.surfaceVerts.length;
		var l = this.surfaceVerts.length;
		var originAcc;
		
		var i = 0;
		
        while(v--) {
            var vertex   = that.surfaceVerts[i];
			var velocity = new THREE.Vector3();
			
			//add noise to origin vector
            vertex.origin.z = data[v]*0.2;
			//Bring vertex back to origin position
			originAcc = new THREE.Vector3();
			originAcc.sub(vertex.origin,vertex.position);
			originAcc.multiplyScalar(0.2);
			velocity.addSelf(originAcc);
			
			//Update buffer
			var x1, x2, y1, y2;

			if ( i % that.res == 0 ) {
				x1 = 0;
				x2 = that.buffer1[ i + 1 ];
			} else if ( i % that.res == that.res - 1 ) {
				x1 = that.buffer1[ i - 1 ];
				x2 = 0;
			} else {
				x1 = that.buffer1[ i - 1 ];
				x2 = that.buffer1[ i + 1 ];
			}
			if ( i < that.res ) {
				y1 = 0;
				y2 = that.buffer1[ i + that.res ];
			} else if ( i > l - that.res - 1 ) {
				y1 = that.buffer1[ i - that.res ];
				y2 = 0;
			} else {
				y1 = that.buffer1[ i - that.res ];
				y2 = that.buffer1[ i + that.res ];
			}
			that.buffer2[ i ] = ( x1 + x2 + y1 + y2 ) / 2 - that.buffer2[ i ];
			that.buffer2[ i ] -= that.buffer2[ i ] / 20;

			//that.buffer2[ i ] = ( ( x1 + x2 + y1 + y2 ) / 2 ) - that.buffer2[ i ];
			//that.buffer1[ i ] += ( that.buffer2[ i ] - that.buffer1[ i ] ) * 0.25;
			
			velocity.addSelf(new THREE.Vector3(0,0,(that.buffer1[ i ]-vertex.position.z)*0.05));
			
			vertex.position.addSelf(velocity);
			
			i++;
        }
		
		temp = that.buffer1;
		that.buffer1 = that.buffer2;
		that.buffer2 = temp;

		this.surface2.geometry = this.surface.geometry;
		
        this.surface.geometry.__dirtyVertices = true;
        this.surface2.geometry.__dirtyVertices = true;

		// set up a request for a render
        requestAnimationFrame($.proxy(this.render,this));
    },

    generateNoise:function ( width, height ) {

		var size = width * height, data = new Float32Array( size ),
		perlin = new ImprovedNoise(), quality = 1, z = 0;

		for ( var i = 0; i < size; i ++ ) {

			data[ i ] = 0

		}

		for ( var j = 0; j < 4; j ++ ) {

			for ( var i = 0; i < size; i ++ ) {

				var x = i % width, y = ~~ ( i / width );
				data[ i ] +=  perlin.noise( x*20 / quality + this.offset_x, y*20 / quality  + this.offset_x, z ) * quality * 1.75 ;


			}

			quality *= 5;

		}
				
		this.offset_x += 0.015;

		return data;

	},

	onWindowResized:function( event ) {
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	}
};

var world = new World();
world.init();