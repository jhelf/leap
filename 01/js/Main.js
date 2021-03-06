function vectorToString(vector, digits) {
  if (typeof digits === "undefined") {
    digits = 1;
  }
  return "(" + vector[0].toFixed(digits) + ", "
             + vector[1].toFixed(digits) + ", "
             + vector[2].toFixed(digits) + ")";
}




World = function(){
	this.renderer;
	this.camera;
	this.scene;

	this.mouseX = 0;
	this.mouseY = 0;

	this.particles = [];

	//Composer variables
	this.renderTargetParameters;
    this.renderTarget;
    this.effectBloom;
    this.composer;

    this.isFullscreen = false;

    //Leap variables
    this.leapTimeOut;
    this.isLeapConnected = false;
};

World.prototype = {
	init:function(){
		var that = this;

		this.renderer 			= new THREE.WebGLRenderer();
        this.camera   			= new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 20000);
        this.scene    			= new THREE.Scene();

        this.scene.fog = new THREE.FogExp2( 0x000000, 0.0005);
            
		this.camera.position.z 	= 1000;
		this.camera.position.y 	= 0;
		this.camera.lookAt(new THREE.Vector3());
            
        // init the renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("container").appendChild(this.renderer.domElement);

        // Init post-processing
        this.renderer.autoClear = false;

		var renderModel = new THREE.RenderPass( this.scene, this.camera );
		var effectBloom = new THREE.BloomPass(1);
		var effectScreen = new THREE.ShaderPass( THREE.ShaderExtras[ "screen" ] );

		effectScreen.renderToScreen = true;

		this.composer = new THREE.EffectComposer( this.renderer );

		this.composer.addPass( renderModel );
		this.composer.addPass( effectBloom );
		this.composer.addPass( effectScreen );

        this.createObjects();

        // set up a request for a render
        requestAnimationFrame($.proxy(this.render,this));

        window.addEventListener( 'resize', $.proxy(this.onWindowResized,this), false );

        document.onkeypress = $.proxy(this.onKeyPressed,this);

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
			    		that.createParticle(pointable.tipVelocity,pointable.tipPosition);
			    	}
			    }
			}
		});
			
	},

	createParticle:function(velocity,position){
		var rand = Math.random()*80+2;
		var cubeGeometry = new THREE.CubeGeometry(rand,rand,rand);
		var cubeMaterial1 = new THREE.MeshLambertMaterial({color: 0x0090ff, wireframe:false});
		var cubeMaterial2 = new THREE.MeshLambertMaterial({color: 0x0090ff, wireframe:true});
		var cube;
		if(Math.random()>0.5){
			cube = new THREE.Mesh(cubeGeometry,cubeMaterial1);
		}
		else{
			cube = new THREE.Mesh(cubeGeometry,cubeMaterial2);
		}

		cube.position.x = position[0].toFixed(1)*4;
		cube.position.y = (position[1].toFixed(1)-250)*4;
		cube.position.z = position[2].toFixed(1)*4;
		cube.scale.x = 0;
		cube.scale.y = 0;
		cube.scale.z = 0;
		cube.rotation.x = Math.random()*360;
		cube.rotation.y = Math.random()*360;

		this.scene.add(cube);
		this.particles.push({elem:cube,opacity:1,speedX:(velocity[0].toFixed(1)*0.01)+((Math.random()-0.5)*4),speedY:(velocity[1].toFixed(1)*0.01)+((Math.random()-0.5)*4),speedZ:(velocity[2].toFixed(1)*0.01)+((Math.random()-0.5)*4),rotX:Math.random()*0.02,rotY:Math.random()*0.02});
		
		//Remove last cube if there is more than 200 cubes to help performance
		if(this.particles.length > 200){
			this.scene.remove(this.particles[0].elem);
			this.particles.shift();
		}
	},

	createObjects:function(){
		var that = this;

		this.light = new THREE.PointLight(0xFFFFFF, 1);
		this.light.position.y = 0;
		this.light.position.x = 1000;
		this.light.position.z = 1000;
		this.scene.add(this.light);
	},

	render:function(){
		var that = this;

		for(var i=0;i<this.particles.length;i++){
			var elem = that.particles[i].elem;
			elem.position.x += that.particles[i].speedX;
			elem.position.y += that.particles[i].speedY;
			elem.position.z += that.particles[i].speedZ;
			elem.rotation.x += that.particles[i].rotX;
			elem.rotation.y += that.particles[i].rotY; 
			elem.scale.x += (1-elem.scale.x)*0.2;
			elem.scale.y += (1-elem.scale.y)*0.2;
			elem.scale.z += (1-elem.scale.z)*0.2;
			elem.material.opacity = that.particles[i].opacity;

			that.particles[i].speedX *= 0.999;
			that.particles[i].speedY *= 0.999;
			that.particles[i].speedZ *= 0.999;
			that.particles[i].opacity -= 0.005;

			if(that.particles[i].opacity <= 0){
				that.scene.remove(elem);
				that.particles.splice(i,1);
				i--;
			}
		}

		//Render

		this.renderer.clear();
		this.composer.render();

		// set up a request for a render
        requestAnimationFrame($.proxy(this.render,this));
    },

    onWindowResized:function( event ) {
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	}
};

var world = new World();
world.init();