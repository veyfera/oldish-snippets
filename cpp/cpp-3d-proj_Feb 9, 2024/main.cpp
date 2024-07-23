#include "circle.h"
#include "ellipse.h"
#include "helix.h"

#include <algorithm>
#include <iostream>
#include <random>
#include <omp.h>

void printCoordinates(Point p);

struct
{
    bool operator()(circle::Circle* a, circle::Circle* b) const { return a->getRadius() < b->getRadius();}
}
radiusLess;


int main()
{
    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> distr(0, 2);
    uniform_real_distribution<> distr_double(1, 100);

    vector<curve::Curve*> curves;
    vector<circle::Circle*> circles;

    for(int i = 0; i < 50; i++)
    {
        int cType = distr(gen);
        double radiusX, radiusY, step;
        radiusX = distr_double(gen);
        switch(cType)
        {
            case CIRCLE:
                curves.push_back(new circle::Circle(radiusX));
                circles.push_back((circle::Circle*)curves[i]);
                break;
            case ELLIPSE:
                radiusY = distr_double(gen);
                curves.push_back(new ellipse::Ellipse(radiusX, radiusY));
                break;
            case HELIX:
                step = distr_double(gen);
                curves.push_back(new helix::Helix(radiusX, step)); break;
            default:
                cerr << "Invalid curve type supplied" << endl;
                break;
        }

        cout << "3D point: ";
        printCoordinates(curves[i]->getPoint(M_PI/4));
        cout << "3D vector: ";
        printCoordinates(curves[i]->getDerivative(M_PI/4));

        cout << "--------------------------------------" << endl;
    }
    //cout << curves.size() << " curves in vector" << endl;
    //cout << circles.size() << " circles in vector" << endl;

    //for (circle::Circle* c: circles)
    //{
        //cout << c->getRadius() << endl;
    //}

    sort(circles.begin(), circles.end(), radiusLess);
    //cout << "------sorted circles-----------" << endl;

    //for (circle::Circle* c: circles)
    //{
        //cout << c->getRadius() << endl;
    //}

    double radiiSum = 0;
    unsigned int cn = circles.size();

#pragma omp parallel for reduction (+:radiiSum)
    for(unsigned int i = 0; i<cn; i++)
    {
        radiiSum += circles[i]->getRadius();
    }

    //cout << "Radii sum: " << radiiSum << endl;
    
    return 0;
}

void printCoordinates(Point p)
{
    std::cout << "x: " << p.x << " y: " << p.y << " z: " << p.z << std::endl;
};

