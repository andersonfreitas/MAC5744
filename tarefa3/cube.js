glMatrix.setMatrixArrayType(Array);

var cube_template = [
  // frente cima
  vec3.fromValues( 1,  0, 0), vec3.fromValues( 0,  1,  0), vec3.fromValues( 0,  0, -1),
  vec3.fromValues( 0,  0, -1), vec3.fromValues( 0,  1, 0), vec3.fromValues(-1,  0,  0),

  // // frente baixo
  vec3.fromValues(-1,  0,  0), vec3.fromValues( 0,  0, -1), vec3.fromValues( 0, -1, 0),
  vec3.fromValues( 0, -1, 0),  vec3.fromValues( 0,  0, -1), vec3.fromValues( 1,  0,  0),

  // // traseira cima
  vec3.fromValues( 1,  0, 0), vec3.fromValues( 0,  1, 0), vec3.fromValues( 0,  0,  1),
  vec3.fromValues(-1,  0, 0), vec3.fromValues( 0,  1, 0), vec3.fromValues( 0,  0,  1),

  // // traseira baixo
  vec3.fromValues( 0,  0, 1), vec3.fromValues(-1,  0, 0), vec3.fromValues( 0, -1, 0),
  vec3.fromValues( 0,  0, 1), vec3.fromValues( 1,  0, 0), vec3.fromValues( 0, -1, 0)
];

var cubeVertexBuffer, cubeColorBuffer;
var cube = []; // _.flatten(cube_template);
var cubeColors = [];

for (var i = 0; i < cube_template.length; i += 3) {
  triangle(cube_template[i+0], cube_template[i+1], cube_template[i+2]);
}
cube = _.flatten(cube);

var rotation = true, wireframe = true;

function initCubeBuffers() {
  cubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(cube)), gl.DYNAMIC_DRAW);
  cubeVertexBuffer.itemSize = 3;
  cubeVertexBuffer.numItems = cube.length/3;

  for (i = 0; i < cube.length; i++) cubeColors.push(lineColor);

  cubeColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(cubeColors)), gl.DYNAMIC_DRAW);
  cubeColorBuffer.itemSize = 3;
  cubeColorBuffer.numItems = cubeColors.length;
}

function updateCube() {
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(cube)), gl.DYNAMIC_DRAW);
  cubeVertexBuffer.numItems = cube.length/3;

  cubeColors = [];
  for (i = 0; i < cube.length; i++) cubeColors.push(lineColor);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(cubeColors)), gl.DYNAMIC_DRAW);
  cubeColorBuffer.numItems = cubeColors.length;
}

function triangle(a, b, c) {
  cube.push(a, b);
  cube.push(b, c);
  cube.push(c, a);
}

function divideTriangle(a, b, c, count) {
  if ( count === 0 ) {
    triangle( a, b, c );
  } else {
    var v1 = vec3.create();
    vec3.add(v1, a, b);
    vec3.normalize(v1, v1);

    var v2 = vec3.create();
    vec3.add(v2, a, c);
    vec3.normalize(v2, v2);

    var v3 = vec3.create();
    vec3.add(v3, b, c);
    vec3.normalize(v3, v3);

    --count;

    divideTriangle( a, v2, v1, count);
    divideTriangle( c, v3, v2, count);
    divideTriangle( b, v1, v3, count);
    divideTriangle(v1, v2, v3, count);
  }
}

