precision mediump float;

uniform float time;
uniform vec2 resolution;

varying vec4 vColor;

void main(void) {
    gl_FragColor = vColor;
}
