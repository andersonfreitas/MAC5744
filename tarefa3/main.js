/**
 * Provides requestAnimationFrame in a cross browser way.
 * paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
window.requestAnimationFrame = window.requestAnimationFrame || ( function() {
  return  window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(  callback, element ) {
            window.setTimeout( callback, 1000 / 60 );
          };
})();

var canvas;
var gl;
var buffer;
var vertex_shader;
var fragment_shader;
var currentProgram;
var vertex_position;
var stats;
var parameters = {  start_time  : new Date().getTime(),
                    time        : 0,
                    screenWidth : 0,
                    screenHeight: 0 };

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function degToRad(degrees) {
  return degrees * Math.PI / 180;
}


function init() {
  vertex_shader = document.getElementById('vs').textContent;
  fragment_shader = document.getElementById('fs').textContent;

  canvas = document.querySelector( 'canvas' );

  // Initialise WebGL
  try {
    gl = canvas.getContext( 'experimental-webgl' );
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch( error ) { }
  if ( !gl ) {
    throw "cannot create webgl context";
  }

  // Create Program

  currentProgram = createProgram( vertex_shader, fragment_shader );


  onWindowResize();
  window.addEventListener( 'resize', onWindowResize, false );

  stats = new Stats();
  stats.setMode(0); // 0: fps, 1: ms
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.body.appendChild( stats.domElement );

  initShaderVars();
  initBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
}

var triangle1VertexPositionBuffer;
var triangle1VertexColorBuffer;
var triangle2VertexPositionBuffer;
var triangle2VertexColorBuffer;
var lastTime = 0;
var rTri = 0;
var linesVertexBuffer, linesColorBuffer;

function initShaderVars() {
  currentProgram.vertexPositionAttribute = gl.getAttribLocation(currentProgram, "aVertexPosition");
  gl.enableVertexAttribArray(currentProgram.vertexPositionAttribute);

  currentProgram.vertexColorAttribute = gl.getAttribLocation(currentProgram, "aVertexColor");
  gl.enableVertexAttribArray(currentProgram.vertexColorAttribute);

  currentProgram.pMatrixUniform = gl.getUniformLocation(currentProgram, "uPMatrix");
  currentProgram.mvMatrixUniform = gl.getUniformLocation(currentProgram, "uMVMatrix");
}

function initBuffers() {
  linesVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, linesVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(linesVertexes)), gl.DYNAMIC_DRAW);
  linesVertexBuffer.itemSize = 2;
  linesVertexBuffer.numItems = linesVertexes.length;

  linesColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, linesColorBuffer);

  for (i = 0; i< linesVertexes.length; i++) linesColors.push(vec3.fromValues(1,1,1));
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(linesColors)), gl.STATIC_DRAW);
  linesColorBuffer.itemSize = 3;
  linesColorBuffer.numItems = linesColors.length;


  circleVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(circle)), gl.DYNAMIC_DRAW);
  circleVertexBuffer.itemSize = 2;
  circleVertexBuffer.numItems = circle.length;

  circleColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, circleColorBuffer);

  for (i = 0; i< circle.length; i++) circleColors.push(vec3.fromValues(1,0,1));
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(circleColors)), gl.DYNAMIC_DRAW);
  circleColorBuffer.itemSize = 3;
  circleColorBuffer.numItems = circleColors.length;
}
glMatrix.setMatrixArrayType(Array);

function updateCircle() {
  gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(circle)), gl.DYNAMIC_DRAW);
  circleVertexBuffer.numItems = circle.length;

  gl.bindBuffer(gl.ARRAY_BUFFER, circleColorBuffer);
  for (i = 0; i< circle.length; i++) circleColors.push(vec3.fromValues(1,0,1));
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(circleColors)), gl.DYNAMIC_DRAW);
  circleColorBuffer.numItems = circleColors.length;
}

var linesVertexes = [
  vec2.fromValues(-1, 0),
  vec2.fromValues(1, 0),
  vec2.fromValues(0, 1),
  vec2.fromValues(0, -1),

  vec2.fromValues(-1, 1),
  vec2.fromValues(1, 1),
  vec2.fromValues(1, 1),
  vec2.fromValues(1, -1),
  vec2.fromValues(1, -1),
  vec2.fromValues(-1, -1),
  vec2.fromValues(-1, -1),
  vec2.fromValues(-1, 1)
];

var circleColorBuffer, circleVertexBuffer;

// LINE_LOOP
// var circle = [
//   vec2.fromValues(-1, 0),
//   vec2.fromValues(0, 1),
//   vec2.fromValues(1, 0),
//   vec2.fromValues(0, -1)
// ];
var circle_template = [
  vec2.fromValues(-1,  0), vec2.fromValues( 0,  1),
  vec2.fromValues( 0,  1), vec2.fromValues( 1,  0),
  vec2.fromValues( 1,  0), vec2.fromValues( 0, -1),
  vec2.fromValues( 0, -1), vec2.fromValues(-1,  0)
];
var circle = [];

function subdivide(a, b, count) {
  if (count === 0)
    addVertex(a, b);
  else {
    var c = mix(a, b, 0.5);
    var theta = Math.atan(c[1]/c[0]);
    var signum = ((c[0] > 0) - (c[0] < 0));

    c[0] = Math.cos(theta) * signum;
    c[1] = Math.sin(theta) * signum;

    --count;
    subdivide(a, c, count);
    subdivide(c, b, count);
  }
}

function addVertex(a, b) {
  circle.push(a, b);
}

for (var i = 0; i < circle_template.length; i+=2) {
  a = circle_template[i];
  b = circle_template[i+1];
  subdivide(a, b, 0);
}

function mix( u, v, s )
{
    if ( typeof s !== "number" ) {
        throw "mix: the last paramter " + s + " must be a number";
    }

    if ( u.length != v.length ) {
        throw "vector dimension mismatch";
    }

    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( s * u[i] + (1.0 - s) * v[i] );
    }

    return result;
}


var linesColors = [];
var circleColors = [];

function setMatrixUniforms() {
  gl.uniformMatrix4fv(currentProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(currentProgram.mvMatrixUniform, false, mvMatrix);
}

function createProgram( vertex, fragment ) {
  var program = gl.createProgram();

  var vs = createShader( vertex, gl.VERTEX_SHADER );
  var fs = createShader( '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment, gl.FRAGMENT_SHADER );

  if ( vs == null || fs == null ) return null;

  gl.attachShader( program, vs );
  gl.attachShader( program, fs );


  gl.deleteShader( vs );
  gl.deleteShader( fs );

  gl.linkProgram( program );

  if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
    alert( "ERROR:\n" +
    "VALIDATE_STATUS: " + gl.getProgramParameter( program, gl.VALIDATE_STATUS ) + "\n" +
    "ERROR: " + gl.getError() + "\n\n" +
    "- Vertex Shader -\n" + vertex + "\n\n" +
    "- Fragment Shader -\n" + fragment );

    return null;
  }
  return program;
}

function createShader( src, type ) {
  var shader = gl.createShader( type );

  gl.shaderSource( shader, src );
  gl.compileShader( shader );

  if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
    alert( ( type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT" ) + " SHADER:\n" + gl.getShaderInfoLog( shader ) );
    return null;
  }
  return shader;
}

function onWindowResize( event ) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  parameters.screenWidth = canvas.width;
  parameters.screenHeight = canvas.height;

  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;
}

function updateAnimation() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
      var elapsed = timeNow - lastTime;

      rTri += (90 * elapsed) / 1000.0;

      gl.bindBuffer(gl.ARRAY_BUFFER, linesVertexBuffer);
  }
  lastTime = timeNow;
}

function animate() {
  requestAnimationFrame(animate);
  stats.begin();
  render();
  updateAnimation();
  stats.end();
}

function render() {

  if ( !currentProgram ) return;
  parameters.time = new Date().getTime() - parameters.start_time;

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  mat4.perspective(pMatrix, 45, (gl.viewportWidth / gl.viewportHeight), 1, 100.0);
  mat4.identity(mvMatrix);

  gl.useProgram(currentProgram);

  gl.uniform1f(gl.getUniformLocation(currentProgram, 'time'), parameters.time / 1000);
  gl.uniform2f(gl.getUniformLocation(currentProgram, 'resolution'), parameters.screenWidth, parameters.screenHeight);

  gl.bindBuffer(gl.ARRAY_BUFFER, linesVertexBuffer);
  gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, linesVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, linesColorBuffer);
  gl.vertexAttribPointer(currentProgram.vertexColorAttribute, linesColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  mat4.translate(mvMatrix, mvMatrix, vec3.fromValues(0, 0, -3));
  setMatrixUniforms();
  gl.lineWidth(1);
  gl.drawArrays(gl.LINES, 0, linesVertexBuffer.numItems);

  gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBuffer);
  gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, circleVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, circleColorBuffer);
  gl.vertexAttribPointer(currentProgram.vertexColorAttribute, circleColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.lineWidth(3);
  gl.drawArrays(gl.LINES, 0, circleVertexBuffer.numItems);

}

init();
animate();
