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

var linesVertexBuffer, linesColorBuffer;

function initBuffers() {
  linesVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, linesVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(linesVertexes)), gl.STATIC_DRAW);
  linesVertexBuffer.itemSize = 2;
  linesVertexBuffer.numItems = linesVertexes.length;

  linesColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, linesColorBuffer);

  var linesColors = [];
  for (i = 0; i< linesVertexes.length; i++) linesColors.push(vec3.fromValues(0.7411764705882353, 0.7647058823529411, 0.7803921568627451));
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_.flatten(linesColors)), gl.STATIC_DRAW);
  linesColorBuffer.itemSize = 3;
  linesColorBuffer.numItems = linesColors.length;
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
    gl.bindBuffer(gl.ARRAY_BUFFER, linesVertexBuffer);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, linesVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, linesColorBuffer);
    gl.vertexAttribPointer(currentProgram.vertexColorAttribute, linesColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.lineWidth(1);
    gl.drawArrays(gl.LINES, 0, linesVertexBuffer.numItems);
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
