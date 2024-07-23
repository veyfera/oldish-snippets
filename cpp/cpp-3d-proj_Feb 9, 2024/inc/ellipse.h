#pragma once

#include "curve.h"

namespace ellipse
{
    class Ellipse : public curve::Curve
    {
        double radiusX, radiusY;
        public:
        Ellipse(double radius_x, double radius_y);

        double getRadiusX();
        double getRadiusY();
        Point getPoint(double t) override;
        Point getDerivative(double t) override;
    };

}

