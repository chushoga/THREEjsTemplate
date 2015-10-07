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
	testObject02, 
	testObjectGeometry02, 
	testObjectMaterial02;

// materials
var textureDiffuse, textureSpec, textureNormal, textureBump, textureEnvironment;

// other
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var loadingScreen;

// -----------------------------------------------------------------------------------------------------

addLoadingScreen();// loading screen
init();
animate();


// ---------------
/* init */
// ---------------
function init() {

	// ********************************************************
	// renderer
	// ********************************************************
	renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.body.appendChild(renderer.domElement);
	
	// ********************************************************
	// scene
	// ********************************************************
	scene = new THREE.Scene();
	
	// ********************************************************
	// camera
	// ********************************************************
	camera = new THREE.PerspectiveCamera(50, WIDTH/HEIGHT,  0.001, 20000);
	camera.position.x = 0;
	camera.position.y = 3;
	camera.position.z = 2;
	
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
	loadingScreen.style.color = '#00ff00';
	loadingScreen.style.fontWeight = 'bold';
	loadingScreen.style.backgroundColor = '#000000';
	loadingScreen.style.zIndex = '2';
	loadingScreen.style.fontFamily = 'Monospace';
	loadingScreen.innerHTML = 'LOADING...';
	document.body.appendChild( loadingScreen );
	console.log("loadingScreen");
}

/* LIGHTS */
function addLights(){
	// -------------------------------------------------------
	/* KEY LIGHT */
	// -------------------------------------------------------
	lightKey = new THREE.SpotLight(0xffffff, 1, 200, 20, 10);
	lightKey.position.set(4, 5, 3);
	
	// shadowMaps
	lightKey.castShadow = true;
	
	lightKey.shadowDarkness = 0.25;
	lightKey.shadowBias = 0.0001;
	lightKey.shadowMapWidth = 2048;
	lightKey.shadowMapHeight = 2048;
	lightKey.shadowCameraNear = 1;
	lightKey.shadowCameraFar = 4000;
	lightKey.shadowCameraFov = 30;
	
	scene.add(lightKey);
	// -------------------------------------------------------
	/* RIM LIGHT */
	// -------------------------------------------------------
	lightRim = new THREE.SpotLight(0xffffff, 0.5, 200, 20, 10);
	lightRim.position.set(-4, 3, 3);
	
	// shadowMaps
	lightRim.castShadow = false;
	
	lightRim.shadowDarkness = 0.2;
	lightRim.shadowBias = 0.0001;
	lightRim.shadowMapWidth = 2048;
	lightRim.shadowMapHeight = 2048;
	lightRim.shadowCameraNear = 1;
	lightRim.shadowCameraFar = 4000;
	lightRim.shadowCameraFov = 30;
	
	scene.add(lightRim);
	// -------------------------------------------------------
	/* BACK LIGHT */
	// -------------------------------------------------------
	lightBack = new THREE.SpotLight(0xffffff, 0.5, 200, 200, 10);
	lightBack.position.set(-3.5, 3, -4);
	
	// shadowMaps
	lightBack.castShadow = false;
	
	lightBack.shadowDarkness = 0.05;
	lightBack.shadowBias = 0.0001;
	lightBack.shadowMapWidth = 2048;
	lightBack.shadowMapHeight = 2048;
	lightBack.shadowCameraNear = 1;
	lightBack.shadowCameraFar = 4000;
	lightBack.shadowCameraFov = 30;
	
	scene.add(lightBack);
	// -------------------------------------------------------
	// spotlight target
	var spotTarget = new THREE.Object3D();
	spotTarget.position.set(0, 0, 0);
	
	lightKey.target = spotTarget;
	lightRim.target = spotTarget;
	lightBack.target = spotTarget;
	
	//lightAmbient = new THREE.AmbientLight(0x404040);
	//scene.add(lightAmbient);
	
	//light helpers
	var sphereSize = 0.25;
	var poinLightHelperKey = new THREE.SpotLightHelper(lightKey, sphereSize);
	var poinLightHelperRim = new THREE.SpotLightHelper(lightRim, sphereSize);
	var poinLightHelperBack = new THREE.SpotLightHelper(lightBack, sphereSize);
	
	//scene.add(poinLightHelperKey);
	//scene.add(poinLightHelperRim);
	//scene.add(poinLightHelperBack);
}

/* MATERIALS */
function addMaterials(){
	
	var textureName = "leather01";
	var textureUrl = "textures/"+textureName+"/";
	var loadedTextureName = textureUrl + textureName;
	var textureExtention = ".png";
	var textureWrappingAmount = 10; // texture wrapping amount (tiling)
	
	// texture - texture msut not be in the same folder or there is an error.
	textureDiffuse = THREE.ImageUtils.loadTexture(loadedTextureName+textureExtention, {}, function(){ / *alert('texture loaded'); */ },	function(){ alert('error');} );
	
	// Specular Map 
	textureSpec = THREE.ImageUtils.loadTexture(loadedTextureName +'_spec'+textureExtention, {}, function(){ /*alert('specular map loaded');*/ }, function(){ alert('error'); });
	
	// Normal Map 
	textureNormal = THREE.ImageUtils.loadTexture(loadedTextureName +'_normal'+textureExtention, {}, function(){ /*alert('Env map loaded');*/ },	function(){ alert('error'); });
	
	// Bump Map 
	textureBump = THREE.ImageUtils.loadTexture(loadedTextureName +'_displace'+textureExtention, {}, function(){ /*alert('Env map loaded');*/ },	function(){ alert('error');	});
	
	// Environment Map 
	textureEnvironment = THREE.ImageUtils.loadTexture('textures/envMaps/envMap.jpg', {}, function(){ /*alert('Env map loaded');*/	},	function(){	alert('error');	});
		
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
	testObjectMaterial02 = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide});
	
	// textured material
	material01 = new THREE.MeshPhongMaterial({
		map: textureDiffuse,
		specularMap: textureSpec,
		envMap: textureEnvironment,
		bumpMap: textureBump,
        normalMap: textureNormal,
        normalScale: new THREE.Vector2( 0.5, 0.5 ),
		specular: 0xffffff,
		shininess: 100,
		reflectivity: 0,
        side: THREE.DoubleSide
	});
	
	// matCap material
	
}

/* OBJECTS */
function addObjects(){
	
	// geometry
	testObjectGeometry01 = new THREE.SphereGeometry(1, 64, 64);
	testObjectGeometry02 = new THREE.PlaneGeometry(100, 100, 1);
	
	// objects
	testObject01 = new THREE.Mesh(testObjectGeometry01, material01); // sphere
	testObject01.castShadow = true;
	testObject01.receiveShadow = true;
	testObject01.position.y = 0;
	
	testObject02 = new THREE.Mesh(testObjectGeometry02, testObjectMaterial02); // ground
	testObject02.rotation.x = Math.PI / 2;
	testObject02.position.y = -1;
	testObject02.receiveShadow = true;
	
	scene.add(testObject01);
	scene.add(testObject02);

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
    //document.body.appendChild( stats.domElement );
}

/* LOADERS */
function addLoaders(){
	var loader = new THREE.JSONLoader();
	
	//load resources
	loader.load(
	// resource url
	'models/monkey.json',
	//functions after model is loaded
	function (geometry, materials){
		var material = new THREE.MeshFaceMaterial(materials);
		var object = new THREE.Mesh(geometry, material01);
		object.castShadow = true;
		//object.receiveShadow = true;
		//scene.add(object);
	}
	);
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
	update();
	render();
}

// ---------------
/* update */
// ---------------
function update() {
	stats.update();
	controls.update(); // updates orbit controls (mouse)
}

// ---------------
/* render */
// ---------------
function render() {
	renderer.render(scene, camera);
}