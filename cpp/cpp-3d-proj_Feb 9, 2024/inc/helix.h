#include "circle.h"

namespace helix
{
    class Helix : public circle::Circle
    {
        double step;
        public:
        Helix(double radius, double step);
        
        void setStep(double step);
        Point getPoint(double t);
        Point getDerivative(double t);
        // use getX, getY, getZ for inheritance
    };

}
