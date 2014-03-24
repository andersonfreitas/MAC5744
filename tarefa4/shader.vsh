attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec4 a_Normal;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform vec3 u_DiffuseLight;
uniform vec3 u_LightDirection;
uniform vec3 u_AmbientLight;
varying vec4 vColor;

void main() {
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  vec3 normal = normalize(a_Normal.xyz);

  float nDotL = max(dot(u_LightDirection, normal), 0.0);
  vec3 diffuse = u_DiffuseLight * aVertexColor.rgb * nDotL;
  vec3 ambient = u_AmbientLight * aVertexColor.rgb;
  vColor = vec4(diffuse + ambient, aVertexColor.a);

  vColor = aVertexColor;
}
