#include "../inc/circle.h"
#include <cmath>
#include <iostream>

namespace circle
{
    Circle::Circle(double radius)
    {
        setType(CIRCLE);
        setRadius(radius);
    }

    double Circle::getRadius()
    {
        return radius;
    }
    void Circle::setRadius(double r)
    {
        if(r<= 0)
        {
            cerr << "radius must be positive" << endl;
            exit(0);
        }
        radius = r;
    }

    Point Circle::getPoint(double t)
    {
        double x = radius * cos(t);
        double y = radius * sin(t);
        double z = 0;
        return {x, y, z};
    }

    Point Circle::getDerivative(double t)
    {
        double x = -radius * sin(t);
        double y = radius * cos(t);
        double z = 0;
        return {x, y, z};
    }
}

