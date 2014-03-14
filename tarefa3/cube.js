
var cube_template = [
  // frente cima
  vec3.fromValues(-1,  0, 0), vec3.fromValues( 0,  1, 0), vec3.fromValues( 0,  0, -1),
  vec3.fromValues( 0,  1, 0), vec3.fromValues( 1,  0, 0), vec3.fromValues( 0,  0, -1),

  // frente baixo
  vec3.fromValues(-1,  0, 0), vec3.fromValues( 0, -1, 0), vec3.fromValues( 0,  0, -1),
  vec3.fromValues( 0, -1, 0), vec3.fromValues( 1,  0, 0), vec3.fromValues( 0,  0, -1),

  // vec3.fromValues( 0,  1, 0), vec3.fromValues( 1,  0, 0),
  // vec3.fromValues( 1,  0, 0), vec3.fromValues( 0, -1, 0),
  // vec3.fromValues( 0, -1, 0), vec3.fromValues(-1,  0, 0)
];

var cubeVertexBuffer, cubeColorBuffer;
var cube = _.flatten(cube_template);
var cubeColors = [];

function initCubeBuffers() {
  cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(cube)), gl.DYNAMIC_DRAW);
  cubeVertexBuffer.itemSize = 3;
  cubeVertexBuffer.numItems = 4;

  for (i = 0; i < cube.length; i++) cubeColors.push(lineColor);

  cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(cubeColors)), gl.DYNAMIC_DRAW);
  cubeColorBuffer.itemSize = 3;
  cubeColorBuffer.numItems = cubeColors.length;
}
