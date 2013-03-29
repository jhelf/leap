WildBall = function(){
	this.ballRadius = 100;

	this.ballMaterial;
	this.ballGeom;
	this.ball;

	this.ballVertices = [];

	this.container;
}

WildBall.prototype = {
	init:function(){
		var that = this;

		//Init main container
		that.container = new THREE.Object3D();

		//Init material
		this.ballMaterial = new THREE.MeshLambertMaterial({
      		color     		: world.currMainColor,
      		wireframe		: true,
      		envMap    		: world.env,
     		shininess 		: 100,
     		specular		: 0xFFFFFF,
			reflectivity	: 0.3,
			combine			: THREE.MixOperation,
      		shading   		: THREE.SmoothShading
		});

		//Create ball geom
		this.ballGeom = new THREE.SphereGeometry(that.ballRadius,4,4);
		this.ballGeom.dynamic = true;

		//Create ball mesh
		this.ball = new THREE.Mesh(this.ballGeom,this.ballMaterial);
		this.ball.position.y = 0;

		//Init ball vertices
		for(var i=0;i<this.ballGeom.vertices.length;i++){
			var vertex = that.ballGeom.vertices[i];
			
			var velX = Math.random()-0.5;
			var velY = Math.random()-0.5;
			var velZ = Math.random()-0.5;
			that.ballVertices[i] = {velX:velX,velY:velY,velZ:velZ};

			vertex.x = 0;
			vertex.y = 0;
			vertex.z = 0;
		}

		//Add ball to the container
		that.container.add(this.ball);

		world.scene.add(that.container);

		that.animateIn(1500);
	},

	destroy:function(){
		world.scene.remove(this.container);
	},

	animateIn:function(time){
		var that = this;

		//Reset animation
		that.reset();

		var tween = new TWEEN.Tween( { rotation: 0} )
	            .to( { rotation: (Math.random()-0.5)*Math.PI*2}, time )
	            .easing( TWEEN.Easing.Exponential.Out )
	            .onUpdate( function () {
	            	that.container.rotation.y = this.rotation;
	            	that.container.rotation.x = this.rotation;
	            } )
	            .start();

	    var tween2 = new TWEEN.Tween( { radius: 0} )
	            .to( { radius: 700 }, time )
	            .easing( TWEEN.Easing.Exponential.Out )
	            .onUpdate( function () {
	            	console.log(this.radius);
	            	for(var i=0;i<that.ballGeom.vertices.length;i++){
						var vertex = that.ballGeom.vertices[i];
						var vel = that.ballVertices[i];

						vertex.x = this.radius*vel.velX;
						vertex.y = this.radius*vel.velY;
						vertex.z = this.radius*vel.velZ;
					}
					that.ballGeom.verticesNeedUpdate = true;
	            } )
	            .start();

	},

	reset:function(){
		
	}
}