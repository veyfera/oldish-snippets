#include "../inc/ellipse.h"
#include <cmath>
#include <iostream>

namespace ellipse
{
    Ellipse::Ellipse(double radius_x, double radius_y)
    {
        if(radius_x <= 0 || radius_y <= 0)
        {
            cerr << "radii must be positive" << endl;
            exit(0);
        }
        setType(ELLIPSE);
        radiusX = radius_x;
        radiusY = radius_y;
    }

    double Ellipse::getRadiusX()
    {
        return radiusX;
    }
    double Ellipse::getRadiusY()
    {
        return radiusY;
    }

    Point Ellipse::getPoint(double t)
    {
        double x = radiusX * cos(t);
        double y = radiusY * cos(t);
        double z = 0;
        return {x, y, z};
    }

    Point Ellipse::getDerivative(double t)
    {
        double x = -radiusX * sin(t);
        double y = radiusY * cos(t);
        double z = 0;
        return {x, y, z};
    }
};

