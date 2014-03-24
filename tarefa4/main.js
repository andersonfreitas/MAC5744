var ConfigProperties = function() {
  this.drawGrid = true;
  this.wireframe = true;
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
  controller = gui.add(config, 'subdivision', 1, 50).step(1);
  controller.onFinishChange(function(newLevel) {
    subdivide(a, b, newLevel);
  });
};

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

var gridVertexBuffer, gridColorBuffer;

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
