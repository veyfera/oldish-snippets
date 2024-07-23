#pragma once

#include "curve.h"

namespace circle
{
    class Circle : public curve::Curve
    {
        double radius;
        public:
        explicit Circle(double radius);
        void setRadius(double radius);
        double getRadius();
        Point getPoint(double t) override;
        Point getDerivative(double t) override;
    };
}

