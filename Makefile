GCC_OPTIONS=-Wall -pedantic -I ../include
GL_OPTIONS=-framework OpenGL -framework GLUT
APPLE_OPTIONS=-Wno-deprecated -Wno-uninitialized
OPTIONS=$(GCC_OPTIONS) $(GL_OPTIONS) $(APPLE_OPTIONS)

.cpp:
	g++ $@.cpp include/initShader.cpp $(OPTIONS) -o $@
