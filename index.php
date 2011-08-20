<html>

<head>
<title>Moogl - A mootools style WebGL engine</title>
<meta http-equiv="content-type" content="text/html; charset=utf-8"/>

<link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/>

<script type="text/javascript" src="3rd/mootools-core-1.3.2.js">;</script>
<script type="text/javascript" src="3rd/mootools-patchs.js">;</script>
<script type="text/javascript" src="3rd/glMatrix-0.9.5.min.js">;</script>
<script type="text/javascript" src="3rd/webgl-utils.js">;</script>
<script type="text/javascript" src="libs/mesh/base.js">;</script>
<script type="text/javascript" src="libs/mesh/cube.js">;</script>
<script type="text/javascript" src="libs/webgl.js">;</script>
<script type="text/javascript" src="libs/shader.js">;</script>
<script type="text/javascript" src="libs/camera.js">;</script>

<script id="lightning-shader-fs" type="x-shader/x-fragment">
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec2 vTextureCoord;
    varying vec3 vLightWeighting;

    uniform sampler2D uSampler;

    void main(void) {
        vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
        gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);
    }
</script>

<script id="lightning-shader-vs" type="x-shader/x-vertex">
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uMVMatrix;
    uniform mat4 uElementMatrix;
    uniform mat4 uPMatrix;


    uniform vec3 uAmbientColor;

    uniform vec3 uLightingDirection;
    uniform vec3 uDirectionalColor;

    uniform bool uUseLighting;

    varying vec2 vTextureCoord;
    varying vec3 vLightWeighting;

    void main(void) {
        gl_Position = uPMatrix * uMVMatrix * uElementMatrix *  vec4(aVertexPosition, 1.0);
        vTextureCoord = aTextureCoord;

        if (!uUseLighting) {
            vLightWeighting = vec3(1.0, 1.0, 1.0);
        } else {
            vec3 transformedNormal = mat3(uMVMatrix * uElementMatrix) * aVertexNormal;
            float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);
            vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;
        }
    }
</script>

<script type="text/javascript">


var webgl;
var xRot  = 0;
var yRot  = 0;

var xSpeed  = 10;
var ySpeed  = 10;

var z  = 0;

  function tick() {
        webgl.animate();
        drawScene();
        requestAnimFrame(tick);
  }



function webGLStart() {
  webgl = new WebGL("lesson02-canvas");
  webgl.registerShader(['lightning-shader-fs', 'lightning-shader-vs']);



  webgl.addEvent('lightUpdate', function(){
    webgl.ambiantColor = [
      parseFloat(document.id("ambientR").value),
      parseFloat(document.id("ambientG").value),
      parseFloat(document.id("ambientB").value)
    ];

    var tmp = [
      parseFloat(document.id("lightDirectionX").value),
      parseFloat(document.id("lightDirectionY").value),
      parseFloat(document.id("lightDirectionZ").value)
    ];
    webgl.lightingDirection = vec3.create();
    vec3.normalize(tmp, webgl.lightingDirection);
    vec3.scale(webgl.lightingDirection, -1);



    webgl.directionalColor = [
      parseFloat(document.id("directionalR").value),
      parseFloat(document.id("directionalG").value),
      parseFloat(document.id("directionalB").value)
    ];
   
  });
  webgl.fireEvent('lightUpdate');
  $$('input[type=text]').addEvent('change', function(){
    webgl.fireEvent('lightUpdate');
  });


  var data = <?include "gen.php"?>;



  var poly = new BaseMesh(webgl);
  poly.load(data, "crate_.gif");

  webgl.stackElement(poly);


    //rotating cube !
  var cube = new Cube(webgl);
  cube.setTexture("crate.gif");
    cube.position([0,10,0]);
  webgl.stackElement(cube);
  webgl.addEvent('animate', function(elapsed){
    var speed=  30/1000;
    cube.rotate(speed*elapsed, [1,0,0]);
    cube.rotate(speed*elapsed, [0,1,0]);
    cube.rotate(speed*elapsed, [0,0,1]);
  });

  //webgl.addEvent('textureReady', function(){  });

  webgl.camera.setControlStyle(Camera.controlStyle.mouselook);
  webgl.camera.translate([10,1.7,30]);
  webgl.camera.rotate(11, [1,0,0]);

  webgl.addEvent('animate', function(elapsed){
    webgl.camera.animate(elapsed);
  });

  tick();
}











function drawScene() {
  var gl = webgl.gl;
  webgl.clear();
  webgl.setPerspective(45,  0.1, 100.0);

  webgl.draw();
}
</script>

<style>
body, html {
  margin:0px;
  padding:0px;
}
</style>
</head>


<body onload="webGLStart();">


<div style="float:left">
    <canvas id="lesson02-canvas" style="border: none;margin:auto;" width="800" height="400"></canvas>
</div>

<div style="float:right">
<h1>Moogl</h1>
<p>A mootools style webGL engine</p>
<p>Use cursors key to move around, mouselook to change camera orientation</p>
<p>Find code on <a href='https://github.com/131/moogl'>github</a>

<p> This is a demo of auto generated map from this picture : <img src="map.png" style="width:100px;height:100px"/>
</p>

</div>

<div style="width:500px;height:500px;float:right;display:none">
    <h2>Directional light:</h2>

    <table style="border: 0; padding: 10px;">
        <tr>
            <td><b>Direction:</b>
            <td>X: <input type="text" id="lightDirectionX" value="0" />
            <td>Y: <input type="text" id="lightDirectionY" value="0" />
            <td>Z: <input type="text" id="lightDirectionZ" value="-1" />

        </tr>
        <tr>
            <td><b>Colour:</b>
            <td>R: <input type="text" id="directionalR" value="0.8" />
            <td>G: <input type="text" id="directionalG" value="0.8" />
            <td>B: <input type="text" id="directionalB" value="0.8" />
        </tr>

    </table>

    <h2>Ambient light:</h2>
    <table style="border: 0; padding: 10px;">
        <tr>
            <td><b>Colour:</b>
            <td>R: <input type="text" id="ambientR" value="0.2" />
            <td>G: <input type="text" id="ambientG" value="0.2" />

            <td>B: <input type="text" id="ambientB" value="0.2" />
        </tr>
    </table>
</div>
</body>

</html>
