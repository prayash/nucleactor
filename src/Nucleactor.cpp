#include "cinder/app/App.h"
#include "cinder/app/RendererGl.h"
#include "cinder/Camera.h"
#include "cinder/Timeline.h"
#include "cinder/Log.h"

using namespace ci;
using namespace ci::app;

class Nucleactor : public App {
public:
    virtual void	setup();
    virtual void	update();
    virtual void	draw();
    
    ColorA          mColor;
};

class Fragment : public App {
public:
    float x, y, px, py, offSet, radius, theta; int dir; ColorA color;
    Fragment() {
        x = 0;
        y = 0;
        offSet = rand() % 2 * M_PI;
        radius = rand() % 10 + 5;
        dir = rand() % 1 > .5 ? 1 : -1;
    }
    
    void run() {
        update();
        showLines();
    }
    
    void update() {
//        float vari = map(sin(theta + offSet), -1, 1, -2, -2);
//        px = map(sin(theta + offSet) , -1, 1, 0, getWindowWidth());
//        py = y + sin(theta * dir) * radius * vari;
    }
    
    void showLines() {
//        for (int i = 0; i < fragments.length; i++) {
//            float distance = dist(px, py, fragments[i].px, fragments[i].py);
//            if (distance > 0 && distance < 100) {
//                // stroke(0, 255);
//                line(px, py, fragments[i].px, fragments[i].py);
//            }
//        }
    }

};

// ************************************************************************************

void Nucleactor::setup() {
    // ** Setup
    CI_LOG_V( "Initializing...");
    
    // Fragments
    Fragment fragments[150];
    for (int i = 0; i < 150; i++) {
        fragments[i].x = rand() % getWindowWidth();
        fragments[i].y = (getWindowHeight() - 2) / float(150) * i;
        CI_LOG_V(fragments[i].x);
        CI_LOG_V(fragments[i].y);
    }
}

// ************************************************************************************

void Nucleactor::update() {
    // ** Update
}

// ************************************************************************************

void Nucleactor::draw() {
    // ** Draw
    gl::clear();
    //	gl::enableDepthRead();
    
    //	gl::setMatrices( mCam );
    //	gl::multModelMatrix( mModelMatrix );
    
    //	gl::drawCoordinateFrame();
    //	gl::drawColorCube( vec3::zero(), vec3( 1, 1, 1 ) );
    //
    float gray = sin( getElapsedSeconds() ) * 0.5f + 0.5f;
    gl::clear( Color( CM_HSV, gray, 0.5f, 0.5f ), true );
    
    
    // ---------------
    // Nucleus
    gl::enableAlphaBlending();
    for (int i = 0; i < 10; i++) {
        gl::color(ColorA( 1, 1, 1, 0.5f));
        gl::drawSolidCircle(getWindowCenter(), 50 / i, 50 / i);
    }
    
    // ---------------
    // Points
    
    // preserve the default Model matrix
    gl::pushModelMatrix();
    // move to the window center
    gl::translate( getWindowCenter() );
    
    int numCircles = 16;
    float radius = getWindowHeight() / 4 - 30;
    
    for( int c = 0; c < numCircles; ++c ) {
        float rel = c / (float)numCircles;
        float angle = rel * M_PI * 2;
        vec2 offset( cos( angle ), sin( angle ) );

        gl::pushModelMatrix();
        // move to the correct position
        gl::translate( offset * radius );
        // set the color using HSV color
        gl::color( Color( CM_HSV, rel, 1, 1 ) );
        gl::color(ColorA( 1, 1, 1, 0.5f));
        // draw a circle relative to Model matrix
        gl::drawSolidCircle( vec2(), 5 );
        // restore the Model matrix
        gl::popModelMatrix();
    }
    
    gl::popModelMatrix();
    
}

// ************************************************************************************

CINDER_APP( Nucleactor, RendererGl )
