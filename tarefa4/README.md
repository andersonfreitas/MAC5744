# Tarefa 4
## Bandeira em WebGL

Faça um programa em WebGL para simular a movimentação de uma bandeira ao vento:

  - Desenhe a bandeira (uma superfície planar em x-z) através de uma série de triângulos adjacentes
  - Use a equação abaixo para a sua movimentação:

  ![](http://www.sciweavers.org/tex2img.php?eq=%5CLARGE%20y%5Cleft%28x%2Ct%5Cright%29%3DA%5Csin%20%5Cleft%28%20%7B%20%5Cfrac%20%7B2%5Cpi%7D%7B%5Clambda%7D%20%7D%20%5Cleft%28%20x-vt%20%5Cright%29%20%5Cright%29&bc=White&fc=Black&im=jpg&fs=18&ff=modern&edit=0)

  - Use o vertex shader para transladar os vértices dos triângulos componentes da superfície no eixo y.
  - Qual o vetor normal correspondente à função acima?
