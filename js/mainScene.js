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

// other
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

// -----------------------------------------------------------------------------------------------------

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
	camera = new THREE.PerspectiveCamera(50, WIDTH/HEIGHT,  0.001, 1000);
	camera.position.x = 0;
	camera.position.y = 3;
	camera.position.z = 6;
	
	// ********************************************************
	// controls (ORBITAL)
	// ********************************************************
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	
	// ********************************************************
	// lights
	// ********************************************************
	
	addLights();

	// ********************************************************
	// materials
	// ********************************************************
	
	addMaterials();
	
	// ********************************************************
	// objects
	// ********************************************************
	addObjects();

	// ********************************************************
	// STATS 
	// ********************************************************
    
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild( stats.domElement );

	// ********************************************************
	// loaders
	// ********************************************************
	addLoaders();
	
	// render on windown resize ----------------------------------------------------------
	window.addEventListener('resize', onWindowResize, false);
	// -----------------------------------------------------------------------------------
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
	testObjectMaterial01 = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0xffffff, shininess: 500, reflectivity: 0, side: THREE.DoubleSide});
	testObjectMaterial02 = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide});
}

/* OBJECTS */
function addObjects(){
	
	// geometry
	testObjectGeometry01 = new THREE.SphereGeometry(1, 64, 64);
	testObjectGeometry02 = new THREE.PlaneGeometry(100, 100, 1);
	
	// objects
	testObject01 = new THREE.Mesh(testObjectGeometry01, testObjectMaterial01); // sphere
	testObject01.castShadow = true;
	testObject01.receiveShadow = true;
	
	testObject02 = new THREE.Mesh(testObjectGeometry02, testObjectMaterial02); // ground
	testObject02.rotation.x = Math.PI / 2;
	testObject02.position.y = 0;
	testObject02.receiveShadow = true;
	
	//scene.add(testObject01);
	scene.add(testObject02);
	
	

	
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
		var object = new THREE.Mesh(geometry, material);
		object.castShadow = true;
		object.receiveShadow = true;
		scene.add(object);
	}
	);
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