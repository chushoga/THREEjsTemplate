/* GLOBAL VARS */
var renderer, scene, camera; // base variables

// lights
var lightKey, lightRim, lightBack;

// extras
var  controls, stats, keyboard;

// objects
var testObject01, 
	testObjectGeometry01, 
	testObjectMaterial01,
	floorObject, 
	floorGeometry, 
	floorMaterial,
	testObjectModel;

// materials
var textureDiffuse, textureSpec, textureNormal, textureBump, textureEnvironment, materialMatCap;

// other
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var loadingScreen;

/* LIGHTS */
var bulbLight, bulbMat, stats, hemiLight;

// ref for lumens: http://www.power-sure.com/lumens.htm
var bulbLuminousPowers = {
	"110000 lm (1000W)": 110000,
	"3500 lm (300W)": 3500,
	"1700 lm (100W)": 1700,
	"800 lm (60W)": 800,
	"400 lm (40W)": 400,
	"180 lm (25W)": 180,
	"20 lm (4W)": 20,
	"Off": 0,
};

// ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
var hemiLuminousIrradiances = {
	"0.0001 lx (Moonless Night)": 0.0001,
	"0.002 lx (Night Airglow)": 0.002,
	"0.5 lx (Full Moon)": 0.5,
	"3.4 lx (City Twilight)": 3.4,
	"50 lx (Living Room)": 50,
	"100 lx (Very Overcast)": 100,
	"350 lx (Office Room)": 350,
	"400 lx (Sunrise/Sunset)": 400,
	"1000 lx (Overcast)": 1000,
	"18000 lx (Daylight)": 18000,
	"50000 lx (Direct Sun)": 50000,
};

var params = {
	shadows: true,
	exposure: 0.68,
	bulbPower: Object.keys( bulbLuminousPowers )[2],
	hemiIrradiance: Object.keys( hemiLuminousIrradiances )[0]
};

// ---------------------------------------------------------

var clock = new THREE.Clock();
var previousShadowMap = false;

// CHANGE TEXTURE ON CLICK!!
$('#button').click(function(){
	//floorObject.material.color.setHex( 0x00ff00 );
	floorObject.material = materialMatCap; // change material to the matcap
	materialMatCap.uniforms.tMatCap.value = THREE.TextureLoader().load( 'textures/matCap/Gold.png' ); // change the texture image to whatever
});
// -----------------------------------------------------------------------------------------------------

addLoadingScreen();// loading screen
init();
animate();


// ---------------
/* init */
// ---------------
function init() {

	//test if webgl is supported and if so use WebGL if not use canvas renderer
	if(Detector.webgl){ 
		// ********************************************************
		// renderer
		// ********************************************************
		renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
	} else {
		renderer = new THREE.CanvasRenderer();
	}
	
	renderer.physicallyCorrectLights = true;
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMap.enabled = true;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor(0x000000, 1);
	document.body.appendChild(renderer.domElement);
	
	// ********************************************************
	// scene
	// ********************************************************
	scene = new THREE.Scene();
	scene.name = "Test Scene";
	
	// ********************************************************
	// camera
	// ********************************************************
	camera = new THREE.PerspectiveCamera(50, WIDTH/HEIGHT,  0.001, 20000);
	camera.position.x = 1;
	camera.position.y = 1.25;
	camera.position.z = 1;
		
	// ********************************************************
	// controls (ORBITAL)
	// ********************************************************
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	//controls.enablePan = false; // dissable pan(set to true to enable)
	controls.maxPolarAngle = Math.PI/2; // dont let camera go below horizon
	// ********************************************************
	
	addLights(); // lights
	addMaterials(); // materials
	addObjects(); // objects
	//addSkybox(); // add skybox
	addStats(); // stats meter
	addLoaders(); // loaders
	//addHelpers(); // helpers
	
	// ********************************************************
	
	// render on windown resize ----------------------------------------------------------
	window.addEventListener('resize', onWindowResize, false);
	// -----------------------------------------------------------------------------------
	
	// ********************************************************
	// LOADING SCREEN
	// ********************************************************
	THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
		
		if(loaded == total){
		console.log("ALL LOADED");
		document.getElementById("loadingScreen").style.display = 'none';
		}
	};
	
	// ********************************************************
	// GUI
	// ********************************************************
	var gui = new dat.GUI();

				gui.add( params, 'hemiIrradiance', Object.keys( hemiLuminousIrradiances ) );
				gui.add( params, 'bulbPower', Object.keys( bulbLuminousPowers ) );
				gui.add( params, 'exposure', 0, 1 );
				gui.add( params, 'shadows' );
				gui.open();
	// ********************************************************
}

/* PHYSICAL LIGHTING SETUP TO RUN WITHIN THE RENDER FUNCTION */
function addPhysicalLighting(){
	renderer.toneMappingExposure = Math.pow( params.exposure, 5.0 ); // to allow for very bright scenes.
	renderer.shadowMap.enabled = params.shadows;
	bulbLight.castShadow = params.shadows;
	if( params.shadows !== previousShadowMap ) {
		//ballMat.needsUpdate = true;
		//cubeMat.needsUpdate = true;
		//floorMat.needsUpdate = true;
		floorMaterial.needsUpdate = true;
		previousShadowMap = params.shadows;
	}
	bulbLight.power = bulbLuminousPowers[ params.bulbPower ];
	bulbMat.emissiveIntensity = bulbLight.intensity / Math.pow( 0.02, 2.0 ); // convert from intensity to irradiance at bulb surface

	hemiLight.intensity = hemiLuminousIrradiances[ params.hemiIrradiance ];
	var time = Date.now() * 0.0005;
	var delta = clock.getDelta();

	bulbLight.position.y = Math.cos( time ) * 0.75 + 1.25;
	//testObject01.position.x = Math.cos ( time ) * 0.25 + 0.5;
	
}

/* LOADING SCREEN */
function addLoadingScreen(){
	
	// loadingScreen
	loadingScreen = document.createElement( 'div' );
	loadingScreen.id = "loadingScreen";
	loadingScreen.style.position = 'absolute';
	loadingScreen.style.top = '0px';
	loadingScreen.style.bottom = '0px';
	loadingScreen.style.width = '100%';
	loadingScreen.style.height = '100%';
	loadingScreen.style.textAlign = 'center';
	loadingScreen.style.lineHeight = '100px';
	loadingScreen.style.color = '#000000';
	loadingScreen.style.fontWeight = 'bold';
	loadingScreen.style.backgroundColor = '#FFFFFF';
	loadingScreen.style.zIndex = '2';
	loadingScreen.style.fontFamily = 'Monospace';
	loadingScreen.innerHTML = 'LOADING...';
	document.body.appendChild( loadingScreen );
	console.log("loadingScreen");
}

/* LIGHTS */
function addLights() {
	// -------------------------------------------------------
	/* KEY LIGHT */
	// -------------------------------------------------------
	lightKey = new THREE.SpotLight(0xffffff, 1, 200, 20, 10);
	lightKey.position.set(4, 5, 3);
	
	// shadowMaps
	lightKey.castShadow = true;
	
	// lightKey.shadowDarkness = 0.25; //removed from r74
	lightKey.shadow.bias = -0.0001;
	lightKey.shadow.mapSize.width = 2048;
	lightKey.shadow.mapSize.height = 2048;
	lightKey.shadow.camera.near = 1;
	lightKey.shadow.camera.far = 4000;
	lightKey.shadow.camera.fov = 30;
	lightKey.name = "Key Light";
	
	//scene.add(lightKey);
	// -------------------------------------------------------
	/* RIM LIGHT */
	// -------------------------------------------------------
	lightRim = new THREE.SpotLight(0xffffff, 0.5, 200, 20, 10);
	lightRim.position.set(-4, 3, 3);
	
	// shadowMaps
	lightRim.castShadow = false;
	
	// lightRim.shadowDarkness = 0.2; //removed from r74
	lightRim.shadow.bias = -0.0001;
	lightRim.shadow.mapSize.width = 2048;
	lightRim.shadow.mapSize.height = 2048;
	lightRim.shadow.camera.near = 1;
	lightRim.shadow.camera.far = 4000;
	lightRim.shadow.camera.fov = 30;
	lightRim.name = "Rim Light";
	
	//scene.add(lightRim);
	// -------------------------------------------------------
	/* BACK LIGHT */
	// -------------------------------------------------------
	lightBack = new THREE.SpotLight(0xffffff, 0.5, 200, 200, 10);
	lightBack.position.set(-3.5, 3, -4);
	
	// shadowMaps
	lightBack.castShadow = false;
	
	// lightBack.shadowDarkness = 0.05; //removed from r74
	lightBack.shadow.bias = -0.0001;
	lightBack.shadow.mapSize.width = 2048;
	lightBack.shadow.mapSize.height = 2048;
	lightBack.shadow.camera.near = 1;
	lightBack.shadow.camera.far = 4000;
	lightBack.shadow.camera.fov = 30;
	lightBack.name = "Back Light";
	
	//scene.add(lightBack);
	// -------------------------------------------------------
	
	// spotlight target
	var spotTarget = new THREE.Object3D();
	spotTarget.position.set(0, 0, 0);
	
	lightKey.target = spotTarget;
	lightRim.target = spotTarget;
	lightBack.target = spotTarget;
	
	lightAmbient = new THREE.AmbientLight(0x404040, 0.6);
	//scene.add(lightAmbient);
	
	//light helpers
	var sphereSize = 0.25;
	var poinLightHelperKey = new THREE.SpotLightHelper(lightKey, sphereSize);
	var poinLightHelperRim = new THREE.SpotLightHelper(lightRim, sphereSize);
	var poinLightHelperBack = new THREE.SpotLightHelper(lightBack, sphereSize);
	
	//scene.add(poinLightHelperKey);
	//scene.add(poinLightHelperRim);
	//scene.add(poinLightHelperBack);
	
	
	// -------------------------------------------------------
	/* TEST LIGHT */
	// -------------------------------------------------------
	var bulbGeometry = new THREE.SphereGeometry( 0.02, 16, 8 );
	bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );

	bulbMat = new THREE.MeshStandardMaterial( {
		emissive: 0xffffee,
		emissiveIntensity: 1,
		color: 0x000000
	});
	
	bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
	bulbLight.position.set( 1, 2, 0 );
	bulbLight.castShadow = true;
	bulbLight.shadow.bias = -0.0001;
	bulbLight.shadow.mapSize.width = 1024;
	bulbLight.shadow.mapSize.height = 1024;
	scene.add( bulbLight );
	
	hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );
	scene.add( hemiLight );
	
	// -------------------------------------------------------
}

/* MATERIALS */
function addMaterials(){
	
	var textureLoader = new THREE.TextureLoader();
	var textureName = "Melamine-wood-001";
	var textureUrl = "textures/wood01/"+textureName+"/";
	var loadedTextureName = textureUrl + textureName;
	var textureExtention = ".png";
	var textureWrappingAmount = 5; // texture wrapping amount (tiling)
	
	// texture - texture msut not be in the same folder or there is an error.
	textureDiffuse = textureLoader.load(loadedTextureName+textureExtention);
	
	// Specular Map 
	textureSpec = textureLoader.load(loadedTextureName +'_spec'+textureExtention, function(){ /*alert('specular map loaded');*/ }, function(){ alert('error'); });
	
	// Normal Map 
	textureNormal = textureLoader.load(loadedTextureName +'_normal'+textureExtention, function(){ /*alert('Env map loaded');*/ },	function(){ alert('error'); });
	
	// Bump Map 
	textureBump = textureLoader.load(loadedTextureName +'_displace'+textureExtention, function(){ /*alert('Env map loaded');*/ },	function(){ alert('error');	});
	
	// Environment Map 
	textureEnvironment = textureLoader.load('textures/envMaps/envMap.jpg', function(){ /*alert('Env map loaded');*/	},	function(){	alert('error');	});
		
	// Texture Wrapping
	textureDiffuse.wrapS = THREE.RepeatWrapping;
	textureDiffuse.wrapT = THREE.RepeatWrapping;
	textureDiffuse.repeat.set(textureWrappingAmount,textureWrappingAmount);
	
	textureSpec.wrapS = THREE.RepeatWrapping;
	textureSpec.wrapT = THREE.RepeatWrapping;
	textureSpec.repeat.set(textureWrappingAmount,textureWrappingAmount);
	
    textureNormal.wrapS = THREE.RepeatWrapping;
	textureNormal.wrapT = THREE.RepeatWrapping;
	textureNormal.repeat.set(textureWrappingAmount,textureWrappingAmount);
    
	textureBump.wrapS = THREE.RepeatWrapping;
	textureBump.wrapT = THREE.RepeatWrapping;
	textureBump.repeat.set(textureWrappingAmount,textureWrappingAmount);
	
	// basic materials
	testObjectMaterial01 = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0xffffff, shininess: 500, reflectivity: 0, side: THREE.DoubleSide});
	
	
	floorMaterial = new THREE.MeshStandardMaterial({
		roughness: 0.8,
		color: 0xffffff,
		metalness: 0.2,
		bumpScale: 0.0005,
		side: THREE.DoubleSide
	});
	
	//FloorTexture HERE
				textureLoader.load( "textures/floor/hardwood.jpg", function( map ) {
					map.wrapS = THREE.RepeatWrapping;
					map.wrapT = THREE.RepeatWrapping;
					map.anisotropy = 4;
					map.repeat.set( 96, 96 );
					floorMaterial.map = map;
					floorMaterial.needsUpdate = true;
				}, function(){alert("errorLoading");} );
				textureLoader.load( "textures/floor/hardwood_displace.jpg", function( map ) {
					map.wrapS = THREE.RepeatWrapping;
					map.wrapT = THREE.RepeatWrapping;
					map.anisotropy = 4;
					map.repeat.set( 96, 96 );
					floorMaterial.bumpMap = map;
					floorMaterial.needsUpdate = true;
				} );
				textureLoader.load( "textures/floor/hardwood_spec.jpg", function( map ) {
					map.wrapS = THREE.RepeatWrapping;
					map.wrapT = THREE.RepeatWrapping;
					map.anisotropy = 4;
					map.repeat.set( 96, 96 );
					floorMaterial.roughnessMap = map;
					floorMaterial.needsUpdate = true;
				} );
	
	
	// textured material
	material01 = new THREE.MeshPhongMaterial({
		map: textureDiffuse,
		specularMap: textureSpec,
		envMap: textureEnvironment,
		bumpMap: textureBump,
        normalMap: textureNormal,
        normalScale: new THREE.Vector2( 0.15, 0.15 ),
		specular: 0xffffff,
		shininess: 30,
		reflectivity: 0.5,
        side: THREE.DoubleSide
	});
	
	// matCap material
	materialMatCap = new THREE.ShaderMaterial( {

			uniforms: { 
				tMatCap: { 
					type: 't', 
					value: new THREE.TextureLoader().load( 'textures/matCap/ChromeB.png' ) 
				},
			},
			vertexShader: document.getElementById( 'sem-vs' ).textContent,
			fragmentShader: document.getElementById( 'sem-fs' ).textContent,
			shading: THREE.SmoothShading,
            side: THREE.DoubleSide
			
		} );

		//materialMatCap.uniforms.tMatCap.value.wrapS = 200;
		//materialMatCap.uniforms.tMatCap.value.wrapT = 200;
		THREE.ClampToEdgeWrapping;
	
}

/* OBJECTS */
function addObjects(){
	
	// geometry
	testObjectGeometry01 = new THREE.SphereGeometry(0.1, 64, 64);
	floorGeometry = new THREE.PlaneGeometry(100, 100, 1);
	
	// objects
	testObject01 = new THREE.Mesh(testObjectGeometry01, materialMatCap); // sphere
	testObject01.castShadow = true;
	testObject01.receiveShadow = true;
	testObject01.position.y = 0.1;
	testObject01.name = "Test Sphere Mesh";
	
	floorObject = new THREE.Mesh(floorGeometry, floorMaterial); // ground
	floorObject.receiveShadow = true;
	floorObject.rotation.x = -Math.PI / 2.0;
	floorObject.position.y = 0;
	floorObject.name = "Test Plane Mesh (ground)";
	
	//scene.add(testObject01);
	scene.add(floorObject);

}

/* SKYBOX */
function addSkybox(){
	
	var imagePrefix = "textures/envMaps/studio033/";
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var imageSuffix = ".png";
	var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );
	
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add( skyBox );
}

/* STATS */
function addStats(){
	stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild( stats.domElement );
}

/* LOADERS */
function addLoaders(){
	/*
	var loader = new THREE.OBJLoader();
	
	//load resources
	loader.load(
	// resource url
	'models/st61.obj',
	//functions after model is loaded
		
	function (geometry, materials){
		
		var material = new THREE.MeshFaceMaterial(materials);
		testObjectModel = new THREE.Mesh(geometry, materialMatCap);
		testObjectModel.position.y = 0;
		testObjectModel.castShadow = true;
		testObjectModel.receiveShadow = true;
		testObjectModel.scale.set(0.5,0.5,0.5);
		testObjectModel.name = "Main Mesh";
		scene.add(testObjectModel);
		
	}
	);
	*/
var material;
var modelPath = "models/st61.obj";
var loader = new THREE.OBJLoader();
    loader.load(modelPath, function (object) {

        //if you want to add your custom material
        var materialObj = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0xffffff, shininess: 0.1, reflectivity: 0.1, side: THREE.DoubleSide});
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
				
				
				/*TESTING*/
				
				var geometry = new THREE.Geometry().fromBufferGeometry( child.geometry );
				geometry.mergeVertices();
				geometry.computeFaceNormals();
				geometry.computeVertexNormals();
				child.geometry = new THREE.BufferGeometry().fromGeometry( geometry );
				
				/*TESTING*/
				
				child.material = materialObj;
				child.castShadow = true;
				child.receiveShadow = true;
            }
        });

        //then directly add the object
        scene.add(object);
		var hex  = 0xff0000;
		var bbox = new THREE.BoundingBoxHelper( object, hex );
		bbox.update();
		scene.add( bbox );
		
		
		// group name
		object.name="myGroup";
		
		// seat
		object.children[0].material = new THREE.MeshPhongMaterial({color: 0x7fa22b, specular: 0xcccccc, shininess: 10, reflectivity: 10, side: THREE.DoubleSide});
		
		// bolts
		object.children[1].material = new THREE.MeshPhongMaterial({color: 0xffffff, reflectivity: 1, side: THREE.DoubleSide});
		
		// backrest
		object.children[2].material = new THREE.MeshPhongMaterial({color: 0x7fa22b, specular: 0xcccccc, shininess: 10, reflectivity: 10, side: THREE.DoubleSide});
		//object.children[2].material = material01;
		
		// frameRim
		object.children[3].material = material01;
		
		// frameLegs
		object.children[4].material = material01;
		
		// footPads
		object.children[5].material = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0xcccccc, shininess: 0.1, reflectivity: 0.1, side: THREE.DoubleSide});
		
    });
}

/* HELPERS */
function addHelpers(){
	// axis
	var axes = new THREE.AxisHelper(2);
	scene.add( axes );
	
}

/* update render on window resize */
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	render();
}

// ---------------
/* animate */
// ---------------
function animate() {
	
	requestAnimationFrame(animate); //60fps
	//testObject01.rotation.y += 0.001;// test animation
	var test123 = scene.getObjectByName('myGroup');
	
	//test123.rotation.y += 0.001;
	
	
	update();
	render();
}

// ---------------
/* update */
// ---------------
function update() {
	
	controls.update(); // updates orbit controls (mouse)
}


// ---------------
/* render */
// ---------------
function render() {
	//add physical lighting
	addPhysicalLighting();
	
	renderer.render(scene, camera);
	stats.update();
}