CC = g++
APP = 3D-hiearchy
LIB = curves.so
SRC_DIR = src/

src_files := $(wildcard $(SRC_DIR)*)
obj_files := $(addsuffix .o, $(basename $(notdir $(src_files))))

all:	$(obj_files) main.o
	$(CC) -fopenmp -o $(APP) $^

define build-obj
	$(CC) -Iinc -Wall -c $<
	$(CC) -Iinc -Wall -c $< -S
endef

main.o: main.cpp
	$(CC) -fopenmp -Iinc -Wall -c main.cpp
	$(CC) -fopenmp -Iinc -Wall -c main.cpp -S

%.o:	src/%.cpp inc/%.h
	$(call build-obj)

lib: lib-dep
	$(CC) -fopenmp -Iinc -o $(APP) main.cpp lib/$(LIB)

lib-dep:
	mkdir -p lib
	$(CC) -fPIC -c -Wall $(src_files)
	$(CC) -shared $(obj_files) -o lib/$(LIB)

clean:
	rm -f *.s *.o $(APP) lib/*.so
