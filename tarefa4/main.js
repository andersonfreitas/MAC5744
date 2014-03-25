var drawGrid = true;
var wireframe = false;

var ConfigProperties = function() {
  this.drawGrid = true;
  this.wireframe = false;
  this.subdivision = 1;
}
window.onload = function() {
  var config = new ConfigProperties();
  var gui = new dat.GUI();

  controller = gui.add(config, 'drawGrid');
  controller.onFinishChange(function(value) {
    drawGrid = value;
  });
  controller = gui.add(config, 'wireframe');
  controller.onChange(function(value) {
    wireframe = value;
  });
  controller = gui.add(config, 'subdivision', 1, 10).step(1);
  controller.onFinishChange(function(newLevel) {
    subdivide(a, b, newLevel);
  });
};

var gridVertexBuffer, gridColorBuffer;
var gridVertexes = [
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

var flagVertexBuffer, flagColorBuffer, flagIndexBuffer, flagNormalBuffer;
var flagVertexes = [
  vec2.fromValues(-1,  1), // a
  vec2.fromValues(-1, -1), // b
  vec2.fromValues( 1,  1), // c
  vec2.fromValues( 1, -1)  // d
]

var flagIndices = [
  0, 1, 2,
  1, 3, 2
]

function initBuffers() {
  // World grid
  gridVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gridVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(gridVertexes)), gl.STATIC_DRAW);
  gridVertexBuffer.itemSize = 2;
  gridVertexBuffer.numItems = gridVertexes.length;

  gridColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gridColorBuffer);

  var linesColors = [];
  for (i = 0; i< gridVertexes.length; i++) linesColors.push(vec3.fromValues(0.7411764705882353, 0.7647058823529411, 0.7803921568627451));
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(linesColors)), gl.STATIC_DRAW);
  gridColorBuffer.itemSize = 3;
  gridColorBuffer.numItems = linesColors.length;

  // Bandeira
  flagVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, flagVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(flagVertexes)), gl.STATIC_DRAW);
  flagVertexBuffer.itemSize = 2;
  flagVertexBuffer.numItems = flagVertexes.length;

  flagIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, flagIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(_.flatten(flagIndices)), gl.STATIC_DRAW);

  // var flagNormals = [];
  // for (i = 0; i< flagVertexes.length; i++) flagNormals.push(vec3.fromValues(0.0, 0.0, 1.0));
  // flagNormalBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, flagNormalBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(flagNormals)), gl.STATIC_DRAW);
  // flagNormalBuffer.itemSize = 3;
  // flagNormalBuffer.numItems = flagNormals.length;

  var flagColors = [];
  for (i = 0; i< flagVertexes.length; i++) flagColors.push(vec3.fromValues(0, 0.7647058823529411, 0));
  flagColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, flagColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(flagColors)), gl.STATIC_DRAW);
  flagColorBuffer.itemSize = 3;
  flagColorBuffer.numItems = flagColors.length;
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

  mat4.translate(mvMatrix, mvMatrix, vec3.fromValues(0, 0, -3));

  setMatrixUniforms();

  if (drawGrid) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gridVertexBuffer);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, gridVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gridColorBuffer);
    gl.vertexAttribPointer(currentProgram.vertexColorAttribute, gridColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.lineWidth(1);
    gl.drawArrays(gl.LINES, 0, gridVertexBuffer.numItems);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, flagVertexBuffer);
  gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, flagVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // gl.bindBuffer(gl.ARRAY_BUFFER, flagNormalBuffer);
  // gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, flagNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, flagColorBuffer);
  gl.vertexAttribPointer(currentProgram.vertexColorAttribute, flagColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  if (wireframe)
    gl.drawElements(gl.LINES, flagIndices.length, gl.UNSIGNED_BYTE, 0);
  else
    gl.drawElements(gl.TRIANGLES, flagIndices.length, gl.UNSIGNED_BYTE, 0);
}

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

init();
animate();
