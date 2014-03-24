# Tarefa 4
## Bandeira em WebGL

Faça um programa em WebGL para simular a movimentação de uma bandeira ao vento:

  - Desenhe a bandeira (uma superfície planar em x-z) através de uma série de triângulos adjacentes
  - Use a equação abaixo para a sua movimentação:

  ![\LARGE y\left(x,t\right)=A\sin \left( { \frac {2\pi}{\lambda} } \left( x-vt \right) \right)](equation.png)
  ![amplitude](amplitude.png)

  - Use o vertex shader para transladar os vértices dos triângulos componentes da superfície no eixo y.
  - Qual o vetor normal correspondente à função acima?
