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

    ci::ColorA      mColor;
};

// ************************************************************************************

void Nucleactor::setup() {
    // ** Setup
    CI_LOG_V( "Initializing...");
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
