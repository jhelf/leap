Rays = function(){
	this.rayLength = 2000;
	this.rayWidth = 1;

	this.numRays = 20;

	this.rayMaterial;

	this.container1;
	this.container2;

	this.rays = [];

	this.container;
}

Rays.prototype = {
	init:function(){
		var that = this;

		//Init main container
		that.container = new THREE.Object3D();

		//Init material
    	this.rayMaterial = new THREE.MeshLambertMaterial({
      		color     		: world.currMainColor,
      		envMap    		: world.env,
     		shininess 		: 100,
     		//specular		: 0xFFFFFF,
			reflectivity	: 0.1,
			combine			: THREE.MixOperation,
      		shading   		: THREE.FlatShading,
      		blending		: THREE.AdditiveBlending,
      		opacity			:0.5,
      		transparent		:true
		});

		//Create torus geom
		var rayGeom = new THREE.CubeGeometry(that.rayWidth,that.rayWidth,that.rayWidth,1,1,1);

		that.container1 = new THREE.Object3D();
		var container1 = new THREE.Object3D();
		that.container1.position.x = 900;
		container1.rotation.z = 0.6;
		container1.position.y = -700;
		container1.add(that.container1);
		for(var i=0;i<that.numRays;i++){

			//Create ray mesh
			var ray = new THREE.Mesh(rayGeom,that.rayMaterial);
			ray.scale.y = 0;
			ray.rotation.x = (Math.random()-0.5)*1;
			ray.rotation.z = (Math.random()-0.5)*1;

			//Add ray to the container
			that.container1.add(ray);
			this.rays.push(ray);
		}

		that.container.add(container1);

		that.container2 = new THREE.Object3D();
		var container2 = new THREE.Object3D();
		that.container2.position.x = -900;
		container2.rotation.z = -0.6;
		container2.position.y = -700;
		container2.add(that.container2);
		for(i=0;i<that.numRays;i++){

			//Create ray mesh
			var ray = new THREE.Mesh(rayGeom,that.rayMaterial);
			ray.scale.y = 0;
			ray.rotation.x = (Math.random()-0.5)*1;
			ray.rotation.z = (Math.random()-0.5)*1;

			//Add ray to the container
			that.container2.add(ray);
			this.rays.push(ray);
		}

		that.container.add(container2);

		world.scene.add(that.container);

		that.animateIn(1000);
	},

	destroy:function(){
		world.scene.remove(this.container);
	},

	animateIn:function(time){
		var that = this;

		//Reset animation
		that.reset();

	    var tween = new TWEEN.Tween( { rotation: 0} )
	            .to( { rotation: Math.PI/2}, time )
	            .onUpdate( function () {
	            	that.container1.rotation.y = this.rotation;
	            	that.container2.rotation.y = -this.rotation;
	            } )
	            .start();


	    var tweenScale = new TWEEN.Tween( { scale: 0} )
	            .to( { scale: that.rayLength*2}, time )
	            .easing( TWEEN.Easing.Cubic.Out )
	            .onUpdate( function () {
	            	for(var i=0;i<that.rays.length;i++){
	            		var ray = that.rays[i];
	            		ray.scale.y = this.scale;
	            	}
	            } )
	            .start();

	},

	reset:function(){
		
	}
}