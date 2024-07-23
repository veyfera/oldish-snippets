#include "../inc/curve.h"
//#include <iostream>

namespace curve
{
    curveType Curve::getType ()
    {
        return type;
    }
    void Curve::setType (curveType cType)
    {
        type = cType;
    }

    Point Curve::getPoint(double t) {
        return {0, 0, 0};
    };
    Point Curve::getDerivative(double t) {
        return {0, 0, 0};
    };

}
