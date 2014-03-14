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


var canvas,
    gl,
    buffer,
    vertex_shader, fragment_shader,
    currentProgram,
    vertex_position,
    stats,
    parameters = {  start_time  : new Date().getTime(),
                    time        : 0,
                    screenWidth : 0,
                    screenHeight: 0 };


var triangle1VertexPositionBuffer;
var triangle1VertexColorBuffer;
var triangle2VertexPositionBuffer;
var triangle2VertexColorBuffer;

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

init();
animate();

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

function initShaderVars() {
  currentProgram.vertexPositionAttribute = gl.getAttribLocation(currentProgram, "aVertexPosition");
  gl.enableVertexAttribArray(currentProgram.vertexPositionAttribute);

  currentProgram.vertexColorAttribute = gl.getAttribLocation(currentProgram, "aVertexColor");
  gl.enableVertexAttribArray(currentProgram.vertexColorAttribute);

  currentProgram.pMatrixUniform = gl.getUniformLocation(currentProgram, "uPMatrix");
  currentProgram.mvMatrixUniform = gl.getUniformLocation(currentProgram, "uMVMatrix");
}

function initBuffers() {
  var vertices = [
       0.0,  0.866,  0.0,
      -1.0,   -1.0,  0.0,
       1.0,   -1.0,  0.0
  ];
  var colors = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0
  ]

  var colorRed = [
      1.0, 0.0, 0.0, 1.0,
      1.0, 0.0, 0.0, 1.0,
      1.0, 0.0, 0.0, 1.0
  ]

  // primeiro triangulo
  triangle1VertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle1VertexPositionBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangle1VertexPositionBuffer.itemSize = 3;
  triangle1VertexPositionBuffer.numItems = 3;

  triangle1VertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle1VertexColorBuffer);
  ;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  triangle1VertexColorBuffer.itemSize = 4;
  triangle1VertexColorBuffer.numItems = 3;

  // segundo triangulo
  triangle2VertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle2VertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangle2VertexPositionBuffer.itemSize = 3;
  triangle2VertexPositionBuffer.numItems = 3;

  triangle2VertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle2VertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorRed), gl.STATIC_DRAW);
  triangle2VertexColorBuffer.itemSize = 4;
  triangle2VertexColorBuffer.numItems = 3;
}

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

var lastTime = 0;

function updateAnimation() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
      var elapsed = timeNow - lastTime;

      rTri += (90 * elapsed) / 1000.0;
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
var rTri = 0;

function render() {

  if ( !currentProgram ) return;

  parameters.time = new Date().getTime() - parameters.start_time;

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
  mat4.identity(mvMatrix);

  mat4.translate(mvMatrix, [-1.5, 0.0, -5.0]);

  gl.useProgram( currentProgram );

  // Set values to program variables

  gl.uniform1f( gl.getUniformLocation( currentProgram, 'time' ), parameters.time / 1000 );
  gl.uniform2f( gl.getUniformLocation( currentProgram, 'resolution' ), parameters.screenWidth, parameters.screenHeight );

  // primeiro triângulo
  mvPushMatrix();
  mat4.rotate(mvMatrix, degToRad(rTri), [0, 0, 1]);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangle1VertexPositionBuffer);
  gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, triangle1VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangle1VertexColorBuffer);
  gl.vertexAttribPointer(currentProgram.vertexColorAttribute, triangle1VertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, triangle1VertexPositionBuffer.numItems);

  // abrindo espaço para o segundo triangulo
  mvPopMatrix();
  mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
  mvPushMatrix();

  mat4.rotate(mvMatrix, degToRad(rTri*-1), [0, 0, 1]);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangle2VertexPositionBuffer);
  gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, triangle2VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, triangle2VertexColorBuffer);
  gl.vertexAttribPointer(currentProgram.vertexColorAttribute, triangle2VertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, triangle2VertexPositionBuffer.numItems);
  mvPopMatrix();
}
