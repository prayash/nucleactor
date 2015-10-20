import ddf.minim.*;
import ddf.minim.analysis.*;

Minim         minim;
AudioPlayer   myAudio;
AudioInput		in;
FFT           myAudioFFT;

int  r = 200;
float rad = 70;
int bsize;
BeatDetect beat;
int colorCounter = 0;

float 				soundWeight;
boolean       showVisualizer   = true;

int           myAudioRange     = 11;
int           myAudioMax       = 100;

float         myAudioAmp       = 40.0;
float         myAudioIndex     = 0.2;
float         myAudioIndexAmp  = myAudioIndex;
float         myAudioIndexStep = 0.35;

float[]       myAudioData      = new float[myAudioRange];

// ************************************************************************************

HDrawablePool rectPool;
HDrawablePool orbPool;
HSwarm 				swarm;
HCanvas				canvasBottom;
HCanvas				canvasTop;

int           poolCols         = 7;
int           poolRows         = 7;
int           poolDepth        = 7;

//                               v BASE = orange            v SNARE = blue
color[]       palette          = {#FF3300, #FF620C, #FF9519, #0095A8, #FFC725, #F8EF33, #FFFF33, #CCEA4A, #9AD561, #64BE7A, #2EA893};

int           rotateNumX       = 0;
int           rotateNumY       = 0;
int           rotateNumZ       = 0;

// ************************************************************************************

int num = 200, frames = 480, edge = 40;
Orb[] orbs = new Orb[num];
float theta;

void setup() {
	size(700, 700, P3D);
	H.init(this).background(#000000).use3D(true).autoClear(true);

	// canvasBottom = new HCanvas(700, 700, P3D).autoClear(false).fade(2);
	// H.add(canvasBottom);

	minim   = new Minim(this);
	in = minim.getLineIn(); // getLineIn(type, bufferSize, sampleRate, bitDepth);
	
	bsize = in.bufferSize();
	beat = new BeatDetect();

	// Fast Fourier Transform
	myAudioFFT = new FFT(in.bufferSize(), in.sampleRate());
	println("bufferSize: " + in.bufferSize() + " . . . " + "sampleRate: " + in.sampleRate());
	myAudioFFT.linAverages(myAudioRange);
	myAudioFFT.window(FFT.GAUSS);

	for (int i = 0; i < num; i++) {
    float x = random(width);
    float y = (height - 2) / float(num) * i;
    orbs[i] = new Orb(x, y);
  }

}

// ************************************************************************************

void draw() {
	myAudioFFT.forward(in.mix);
	beat.detect(in.mix);
	myAudioDataUpdate();

	int soundWeight	 = (int)map((in.mix.level() * 10), 0, 10, 0, 10);
	int snareWeight = (int)map((myAudioData[3] + myAudioData[4]) / 2, 0, 25, 0, 255);
	int gradientVariance = (int)map(myAudioData[3], 0, 100, 0, 25);

	if (gradientVariance > 15) {
		gradientVariance = 50;
	}
	
	// Gradient
	fill(0);
  colorMode(HSB, 100, 1, 1);
  noStroke();
  beginShape();

  	// Yellows and Reds
	  fill(12.5 * sin((colorCounter + gradientVariance * 0.025 ) / 100.0) + 12.5, 1, 1);
	  vertex(-width, -height);
	  
	  // Yellows and Whites
	  fill(12.5 * cos((colorCounter - gradientVariance * 0.025 ) / 200.0) + 37.5, 1, 1);
	  vertex(width, -height);

	  // Blues and Greens
	  fill(12.5 * cos((colorCounter + gradientVariance * 0.025 ) / 100.0) + 62.5, 1, 1);
	  vertex(width, height);
	  
	  // Reds + Purples
	  fill(12.5 * sin((colorCounter + gradientVariance * 0.025 ) / 200.0) + 87.5, 1, 1);
	  vertex(-width, height);

  endShape();
  colorCounter += gradientVariance;

	// Orb System
	pushMatrix();

		// Nucleus
		colorMode(RGB); // Reset colorMode
	  translate(width/2, height/2);
	  noFill();
	  fill(-1, 150);

	  if (beat.isOnset()) {
	  	rad = rad * 0.85;
	  	fill(0, 149, 168, 200);
	  } else {
	  	rad = 150;
	  }
	  for (int i = 0; i < bsize - 1; i += 5) {
	    ellipse(0, 0, 7 * rad / i, 7 * rad / i);
	  }

	  // Lines
	  stroke(-1, snareWeight / 2); // stroke alpha mapped to snare's volume
	  for (int i = 0; i < bsize - 1; i += 5) {
	    float x = (r) * cos(i * 2 * PI/bsize);
	    float y = (r) * sin(i * 2 * PI/bsize);
	    float x2 = (r + in.left.get(i) * 20) * cos(i * 2 * PI/bsize);
	    float y2 = (r + in.left.get(i) * 20) * sin(i * 2 * PI/bsize);
	    strokeWeight(snareWeight * 0.0125);
	    line(x, y, x2, y2);
	  }

	  // Points
	  beginShape();
		  noFill();
		  stroke(-1, 180);
		  for (int i = 0; i < bsize; i += 30) {
		    float x2 = (r + in.left.get(i) * 30) * cos(i * 2 * PI/bsize);
		    float y2 = (r + in.left.get(i) * 30) * sin(i * 2 * PI/bsize);
		    vertex(x2, y2);
		    pushStyle();
			    stroke(-1);
			    strokeWeight(5);
			    point(x2, y2);
		    popStyle();
		  }
	  endShape();

	popMatrix();

	// Fragments
	stroke(-1, snareWeight * 0.0225);
  strokeWeight(soundWeight);
  for (int i = 0; i < orbs.length; i++) {
  	orbs[i].x = myAudioData[5] * 5;
		// orbs[i].y = myAudioData[6];
		orbs[i].px = myAudioData[5] * 50;
		orbs[i].py = myAudioData[6] * 5;
		orbs[i].run();
	}
	theta += TWO_PI/frames * 0.5;

  if (keyPressed) {
    if (key == 'w') {
      showVisualizer = true;
    } else if (key == 'W') {
    	showVisualizer = false;
    }
  }

	if (showVisualizer) myAudioDataWidget();
}

// ************************************************************************************

class Orb {
 
  float x, y;
  float px, py, offSet, radius;
  int dir;
  color col;
 
  Orb(float _x, float _y) {
    x = _x;
    y = _y;
    offSet = random(TWO_PI);
    radius = random(5, 10);
    dir = random(1) > .5 ? 1 : -1;
  }
 
  void run() {
    update();
    showLines();
  }
 
  void update() {
    float vari = map(sin(theta+offSet),-1,1,-2,-2);
    px = map(sin(theta+offSet),-1,1,0,width);
    py = y + sin(theta*dir)*radius*vari;
 
  }
 
  void showLines() {
    for (int i = 0; i < orbs.length; i++) {
      float distance = dist(px, py, orbs[i].px, orbs[i].py);
      if (distance > 0 && distance < 60) {
        // stroke(0, 255);
        line(px, py, orbs[i].px, orbs[i].py);
      }
    }
  }
 
}

void myAudioDataUpdate() {
	for (int i = 0; i < myAudioRange; ++i) {
		float tempIndexAvg = (myAudioFFT.getAvg(i) * myAudioAmp) * myAudioIndexAmp;
		float tempIndexCon = constrain(tempIndexAvg, 0, myAudioMax);
		myAudioData[i]     = tempIndexCon;
		myAudioIndexAmp		+= myAudioIndexStep;
		println(myAudioData);
	}

	myAudioIndexAmp 		 = myAudioIndex;
}

void myAudioDataWidget() {
	noLights();
	hint(DISABLE_DEPTH_TEST);
	noStroke(); fill(0,200); rect(0, height-112, width, 102);
	for (int i = 0; i < myAudioRange; ++i) {
		fill(#CCCCCC); rect(10 + (i*5), (height-myAudioData[i])-11, 4, myAudioData[i]);
	}
	hint(ENABLE_DEPTH_TEST);
}

void stop() {
	myAudio.close();
	minim.stop();  
	super.stop();
}

// ************************************************************************************