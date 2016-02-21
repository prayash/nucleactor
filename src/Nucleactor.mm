#include "cinder/app/App.h"
#include "cinder/app/RendererGl.h"
#include "cinder/Log.h"
#include "cinder/Shape2d.h"
#include "cinder/gl/gl.h"
#include "cinder/audio/Context.h"
#include "cinder/audio/GenNode.h"
#include "cinder/audio/GainNode.h"

#import <AVFoundation/AVFoundation.h>

using namespace ci;
using namespace ci::app;
using namespace std;

class Nucleactor : public App {
public:
    void                setup() override;
    void                draw() override;
    void                mouseDrag(MouseEvent event) override;
    
    
    ColorA              mColor;
    audio::GenNodeRef	mGen;	// Gen's generate audio signals
    audio::GainNodeRef	mGain;	// Gain modifies the volume of the signal
};

class Fragment : public App {
public:
    float x, y, px, py, offSet, radius, theta;
    int dir; ColorA color;

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
    // * Setup
    NSLog(@"Initializing...");
    
    // * Headphone detection
    AVAudioSessionRouteDescription* route = [[AVAudioSession sharedInstance] currentRoute];
    for (AVAudioSessionPortDescription* desc in [route outputs]) {
        if ([[desc portType] isEqualToString:AVAudioSessionPortHeadphones])
            NSLog(@"Headphones connected.");
        else
            NSLog(@"No headphones.");
    }
    
    // * Fragments
    Fragment fragments[150];
    for (int i = 0; i < 150; i++) {
        fragments[i].x = rand() % getWindowWidth();
        fragments[i].y = (getWindowHeight() - 2) / float(150) * i;
//        fragments[i] = new Fragment(x, y);
        
//        CI_LOG_V(fragments[i].x);
//        CI_LOG_V(fragments[i].y);
    }

    // You use the audio::Context to make new audio::Node instances (audio::master() is the speaker-facing Context).
    auto ctx = audio::master();
    mGen = ctx->makeNode( new audio::GenSineNode );
    mGain = ctx->makeNode( new audio::GainNode );
    
    mGen->setFreq( 220 );
    mGain->setValue( 0.5f );
    
    // connections can be made this way or with connect(). The master Context's getOutput() is the speakers by default.
    mGen >> mGain >> ctx->getOutput();
    
    // Node's need to be enabled to process audio. EffectNode's are enabled by default, while NodeSource's (like Gen) need to be switched on.
    mGen->enable();
    
    // Context also must be started. Starting and stopping this controls the entire DSP graph.
    ctx->enable();
}

// ************************************************************************************

void Nucleactor::mouseDrag( MouseEvent event ) {
    mGen->setFreq( event.getPos().x );
    mGain->setValue( 1.0f - (float)event.getPos().y / (float)getWindowHeight() );
}

// ************************************************************************************

void Nucleactor::draw() {
    // * Draw
    gl::clear();
    //	gl::enableDepthRead();
    
    // Gradience
    float hue = sin(getElapsedSeconds()) * 0.5f + 0.5f;
    gl::clear( Color(CM_HSV, hue, 0.5f, 0.5f ), true );
    gl::clear( Color( 0, mGain->getValue(), 0.2f ) );
    
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
    
    for(int c = 0; c < numCircles; ++c) {
        float rel = c / (float)numCircles;
        float angle = rel * M_PI * 2;
        vec2 offset( cos( angle ), sin( angle ) );
        gl::pushModelMatrix();
        // move to the correct position
        gl::translate( offset * radius );
        // set the color using HSV color
        gl::color(Color( CM_HSV, rel, 1, 1));
        gl::color(ColorA( 1, 1, 1, 0.5f));
        // draw a circle relative to Model matrix
        gl::drawSolidCircle( vec2(), 5 );
//        gl::drawLine(vec2(100, 100), vec2(200, 200));
        // restore the Model matrix
        gl::popModelMatrix();
    }
    
    for (int i = 0; i < 8; ++i) {
        float radius = 100.0f;
        gl::pushModelMatrix();
        
        Path2d  mPath1, mPath2, mPath3, mPath4;
        mPath1.arc(vec2(0.0f, 0.0f), radius, M_PI * 0.001f, M_PI * 0.0f, true);
        mPath1.arc(vec2(0.0f, 0.0f), radius + 15, M_PI * 0.0f, M_PI * 0.001f, false);
        mPath1.close();
        
        mPath2.arc(vec2(0.0f, 0.0f), radius - 20, M_PI * 0.7f, M_PI * 1.3f, true);
        mPath2.arc(vec2(0.0f, 0.0f), radius, M_PI * 1.3f, M_PI * 0.7f, false);
        mPath2.close();
        
        mPath3.arc(vec2(0.0f, 0.0f), radius + 80, M_PI * 0.2f, M_PI * 0.0f, true);
        mPath3.arc(vec2(0.0f, 0.0f), radius + 90, M_PI * 0.0f, M_PI * 0.2f, false);
        mPath3.close();
        
        mPath4.arc(vec2(0.0f, 0.0f), radius + 60, M_PI * 0.4f, M_PI * 0.0f, false);
        mPath4.arc(vec2(0.0f, 0.0f), radius + 80, M_PI * 0.0f, M_PI * 0.4f, true);
        mPath4.close();
        
        gl::color(1, 1, 1, 0.1f);
//        gl::drawSolid(mPath1);
        gl::drawSolid(mPath2);
        gl::drawSolid(mPath3);
        gl::drawSolid(mPath4);
        gl::popModelMatrix();
    }
    
    gl::popModelMatrix();
    
}

// ************************************************************************************

CINDER_APP(Nucleactor, RendererGl, []( App::Settings *settings ) {
    settings->setMultiTouchEnabled( false );
})