#pragma once

#include "types.h"
//#include <iostream>

using namespace std;

namespace curve
{
    class Curve {
        curveType type;
        //double x, y, z = 0;
        //double dx, dy, dz;

        public:

        virtual ~Curve() = default;

        curveType getType();
        void setType(curveType cType);

        virtual Point getPoint(double t);
        virtual Point getDerivative(double t);

    };


}
