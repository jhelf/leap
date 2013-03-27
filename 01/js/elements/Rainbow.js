Rainbow = function(){
	this.numTorus = 5;
	this.torusWidth = 15;
	this.torusRadius = 350;

	this.torusArray = [];

	this.material;
	this.material2;

	this.keyFrames = 20;
	this.lastKeyframe = 0;;
	this.currentKeyframe = 0;

	this.light;
	this.light2;

	this.lights = [];
	this.lightsColor = [0xFFFF00,0xFF00FF,0x00FFFF,0x0000FF,0x00FF00];

	this.container;
}

Rainbow.prototype = {
	init:function(){
		var that = this;

		//Init main container
		that.container = new THREE.Object3D();

		//Init material
    	this.material = new THREE.MeshLambertMaterial({
      		color     		: 0x101010,
      		envMap    		: world.env,
     		shininess 		: 100,
     		specular		: 0xFFFFFF,
			reflectivity	: 0.1,
			combine			: THREE.MixOperation,
      		shading   		: THREE.FlatShading,
      		morphTargets 	: true
		});

		this.material2 = new THREE.MeshLambertMaterial({
      		color     		: world.currMainColor,
      		envMap    		: world.env,
     		shininess 		: 100,
     		specular		: 0xFFFFFF,
			reflectivity	: 0.1,
			combine			: THREE.MixOperation,
      		shading   		: THREE.FlatShading,
      		morphTargets 	: true
		});

		for(var i=0;i<this.numTorus;i++){
			//Create main geom
			var geom = new THREE.TorusGeometry(that.torusRadius+(i*that.torusWidth*2),that.torusWidth-5,4,20,0.00001);

			//Create morphtargets for animation
			for(var j=1;j<=that.keyFrames;j++){
				var g = new THREE.TorusGeometry(that.torusRadius+(i*that.torusWidth*2),that.torusWidth-5,4,20,(Math.PI/that.keyFrames)*j);
				geom.morphTargets.push({name:"target"+i,vertices:g.vertices});
			}

			//Create mesh
			var mesh = new THREE.Mesh(geom,that.material2);
			mesh.rotation.y = Math.PI;
			mesh.position.y = -200;

			//Add mesh to the world
			that.container.add(mesh);
			that.torusArray.push({mesh:mesh,lastKeyframe:0,currentKeyframe:0});

		}

		for(i=0;i<this.numTorus;i++){
			//Create main geom
			var geom = new THREE.TorusGeometry(that.torusRadius+(i*that.torusWidth*2),that.torusWidth,4,20,0.00001);

			//Create morphtargets for animation
			for(var j=1;j<=that.keyFrames;j++){
				var g = new THREE.TorusGeometry(that.torusRadius+(i*that.torusWidth*2),that.torusWidth,4,20,((Math.PI-1)/that.keyFrames)*j);
				geom.morphTargets.push({name:"target"+i,vertices:g.vertices});
			}

			//Create mesh
			var mesh = new THREE.Mesh(geom,that.material);
			mesh.rotation.y = Math.PI;
			mesh.position.y = -200;

			//Add mesh to the world
			that.container.add(mesh);
			that.torusArray.push({mesh:mesh,lastKeyframe:0,currentKeyframe:0});

		}

		world.scene.add(that.container);

		that.animateIn(1500);
	},

	destroy:function(){
		world.scene.remove(this.container);
	},

	animateIn:function(time){
		var that = this;

		var d = 150;


		//Reset animation
		that.reset();

		for(var i=0;i<that.torusArray.length;i++){

	        var tween = new TWEEN.Tween( { frame: 0, ident:i,rot:0} )
	            .to( { frame: that.keyFrames, rot:0.5 }, time )
	            .easing( TWEEN.Easing.Exponential.Out )
	            .delay(Math.floor(i%(that.torusArray.length/2))*d+(Math.floor(i/(that.torusArray.length/2))*200))
	            .onUpdate( function () {
	            	if(this.ident<that.torusArray.length/2){
	                	that.animUpdate(this.frame,this.ident);
	            	}
	            	else{
	            		that.animUpdate(this.frame,this.ident,this.rot);
	            	}

	            } )
	            .start();

	    }
	    

	},

	animUpdate:function(frame,targetId,rotation){
		var that = this;
		var mesh = that.torusArray[targetId].mesh;

		var keyframe = Math.floor( frame );

		if ( keyframe != that.torusArray[targetId].currentKeyframe ) {

			
			mesh.morphTargetInfluences[ that.torusArray[targetId].lastKeyframe ] = 0;
			mesh.morphTargetInfluences[ that.torusArray[targetId].currentKeyframe ] = 1;
			mesh.morphTargetInfluences[ keyframe ] = 0;
	

			that.torusArray[targetId].lastKeyframe = that.torusArray[targetId].currentKeyframe;
			that.torusArray[targetId].currentKeyframe = keyframe;

		}

		mesh.morphTargetInfluences[ keyframe ] = frame-keyframe;
		if(keyframe != 0){
			mesh.morphTargetInfluences[ that.torusArray[targetId].lastKeyframe ] = 1 - mesh.morphTargetInfluences[ keyframe ];
		}

		if(rotation){
			mesh.rotation.z = rotation;
		}
	},

	reset:function(){
		for(var i=0;i<this.torusArray.length;i++){
			var mesh = this.torusArray[i].mesh;
			for(var j=0;j<mesh.morphTargetInfluences.length;j++){
				if(j==0){
					mesh.morphTargetInfluences[j] = 0;
				}
				else{
					mesh.morphTargetInfluences[j] = 0;
				}
				mesh.rotation.z = 0;
			}
		}
	}
}