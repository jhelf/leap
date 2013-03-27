BigBall = function(){
	this.ballRadius = 100;
	this.torusWidth = 20;

	this.ballMaterial;
	this.torusMaterial;

	this.ball;
	this.torus;

	this.container;
}

BigBall.prototype = {
	init:function(){
		var that = this;

		//Init main container
		that.container = new THREE.Object3D();

		//Init material
    	this.torusMaterial = new THREE.MeshLambertMaterial({
      		color     		: 0x101010,
      		envMap    		: world.env,
     		shininess 		: 100,
     		specular		: 0xFFFFFF,
			reflectivity	: 0.1,
			combine			: THREE.MixOperation,
      		shading   		: THREE.FlatShading
		});

		this.ballMaterial = new THREE.MeshLambertMaterial({
      		color     		: world.currMainColor,
      		envMap    		: world.env,
     		shininess 		: 100,
     		specular		: 0xFFFFFF,
			reflectivity	: 0.3,
			combine			: THREE.MixOperation,
      		shading   		: THREE.SmoothShading
		});

		//Create torus geom
		var torusGeom = new THREE.TorusGeometry(that.ballRadius+that.torusWidth/2,that.torusWidth,10,20);

		//Create torus mesh
		this.torus = new THREE.Mesh(torusGeom,that.torusMaterial);
		this.torus.scale.x = 0;
		this.torus.scale.y = 0;
		this.torus.scale.z = 0;
		this.torus.rotation.x = Math.PI/2;
		this.torus.position.y = -200;

		//Add torus to the container
		that.container.add(this.torus);

		//Create ball geom
		var ballGeom = new THREE.SphereGeometry(that.ballRadius,10,10);

		//Create ball mesh
		this.ball = new THREE.Mesh(ballGeom,this.ballMaterial);
		this.ball.scale.x = 0;
		this.ball.scale.y = 0;
		this.ball.scale.z = 0;
		this.ball.position.y = -200;

		//Add ball to the container
		that.container.add(this.ball);

		world.scene.add(that.container);

		that.animateIn(300);
	},

	destroy:function(){
		world.scene.remove(this.container);
	},

	animateIn:function(time){
		var that = this;

		//Reset animation
		that.reset();

	    var tween = new TWEEN.Tween( { scale: 0} )
	            .to( { scale: 1 }, time )
	            .easing( TWEEN.Easing.Back.Out )
	            .onUpdate( function () {
	            	that.ball.scale.x = this.scale;
	            	that.ball.scale.y = this.scale;
	            	that.ball.scale.z = this.scale;

	            	that.torus.scale.x = this.scale;
	            	that.torus.scale.y = this.scale;
	            	that.torus.scale.z = this.scale;
	            } )
	            .start();

	},

	reset:function(){
		
	}
}