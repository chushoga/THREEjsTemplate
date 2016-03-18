<!doctype html>

<html lang="en">
<head>
	<meta charset="utf-8">

	<title>THREEjs TEMPLATE</title>
	<meta name="description" content="THREEjs TEMPLATE">
	<meta name="author" content="SitePoint">
	<style>
		* {
			margin: 0;
			padding: 0;
		}

		body {
			font-family: Monospace;
			font-weight: bold;
			background-color: #FFFFFF;
			margin: 0px;
			overflow: hidden;
		}
		canvas {
			z-index: 0;
		}


	</style>

	<script src='js/three.min.js'></script>
	<script src="js/OrbitControls.js"></script> <!-- using mouse to rotate around the screen -->
	<script src="js/stats.min.js"></script>
	<script src='js/threex.keyboardstate.js'></script>
	<script src='js/ColladaLoader.js'></script>
	<script src='js/loaders/ObjectLoader.js'></script>
	<script src='js/loaders/OBJLoader.js'></script>


	 <!-- SCRIPT INCLUDES HERE -->
	<script src="js/jquery-1.9.1.js"></script>
	<script src="js/jquery-ui.js"></script>
	<link rel=stylesheet href="css/jquery-ui.css" />
	<link rel=stylesheet href="css/info.css"/>
	<script src="js/info.js"></script>
	<script src="js/ShaderMaterial.js"></script><!-- shaders here -->
	

</head>


<body>

	<!-- shader includes here  -->
	<?php 
		include_once("shaders/shader01.php");
	?>
	
	<div id="infoButton"></div>
	<div id="infoBox" title="Demo Information">
	This three.js demo is part of a collection at
	<a href="http://www.tform.co.jp">HOWE PRODUCTIONS</a><br>
	<button id="button">Change color</button>
	</div>
	<!-- main page start here -->
	<script src='js/mainScene.js'></script>
</body>
</html>