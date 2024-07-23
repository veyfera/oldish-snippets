## Simple implementation of 3D curves hierarchy

### Build instructions (tested on Linux)
```make``` to build project

```make lib``` to build project with curves implemented as a shared library

```make clean``` to remove all temporary files and the executable also

All the required functionality works, but I might move the implementation into a library of curves (done) and improve/clean up some of the code in the near future

### Known issuses:
if you build using ```make lib```, moving the executable file to a different directory and runnig it will cause an error - should be fixed by moving `curves.so` to `/usr/lib`(differs across Linux distributions)

