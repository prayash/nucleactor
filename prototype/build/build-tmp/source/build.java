import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import ddf.minim.*; 
import ddf.minim.analysis.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class build extends PApplet {




Minim         minim;
AudioPlayer   myAudio;
AudioInput    in;
FFT           myAudioFFT;

int           r                = 200;
float         rad              = 150;
int           bsize;
int           colorCounter     = 0;

boolean       showVisualizer   = false;

int           myAudioRange     = 11;
int           myAudioMax       = 100;

float         myAudioAmp       = 40.0f;
float         myAudioIndex     = 0.2f;
float         myAudioIndexAmp  = myAudioIndex;
float         myAudioIndexStep = 0.35f;
float[]       myAudioData      = new float[myAudioRange];

int volume;
int trebleWeight;


int num = 150, frames = 480, edge = 40;
Fragment[] fragments = new Fragment[num];
float theta;
ArrayList<Arc> arcs = new ArrayList<Arc>();

// ************************************************************************************

public void setup() {
  
  hint(ENABLE_STROKE_PURE);

  minim = new Minim(this);
  in = minim.getLineIn(); // getLineIn(type, bufferSize, sampleRate, bitDepth);
  bsize = in.bufferSize();

  // Fast Fourier Transform
  myAudioFFT = new FFT(in.bufferSize(), in.sampleRate());
  myAudioFFT.linAverages(myAudioRange);
  // myAudioFFT.window(FFT.GAUSS);

  // Fragments
  for (int i = 0; i < num; i++) {
    float x = random(width);
    float y = (height - 2) / PApplet.parseFloat(num) * i;
    fragments[i] = new Fragment(x, y);
  }

  // Arc generator
  generateArcs();

}

// ************************************************************************************

public void draw() {
  myAudioFFT.forward(in.mix);
  myAudioDataUpdate();

  // Audio Data Mappings
  volume = (int)map((in.mix.level() * 10), 0, 10, 0, 10);
  trebleWeight = (int)map((myAudioData[3] + myAudioData[4] + myAudioData[5] +
  myAudioData[6] + myAudioData[7] + myAudioData[8] + myAudioData[9]), 0, 255, 0, 255);
  int gradientVariance = (int)map(myAudioData[3], 0, 100, 0, 25);

  // ---------------
  // Background
  fill(0);
  colorMode(HSB, 100, 1, 1);
  noStroke();
  beginShape();
    // Yellows and Reds
    fill(12.5f * sin((colorCounter + gradientVariance * 0.025f ) / 100.0f) + 12.5f, 1, 1);
    vertex(-width, -height);

    // Yellows and Whites
    fill(12.5f * cos((colorCounter - gradientVariance * 0.025f ) / 200.0f) + 37.5f, 1, 1);
    vertex(width, -height);

    // Blues and Greens
    fill(12.5f * cos((colorCounter * 0.025f ) / 100.0f) + 62.5f, 1, 1);
    vertex(width, height);

    // Reds + Purples
    fill(12.5f * sin((colorCounter + gradientVariance * 0.25f ) / 200.0f) + 87.5f, 1, 1);
    vertex(-width, height);

  endShape();
  if (gradientVariance > 15) gradientVariance += 50;
  colorCounter += gradientVariance;

  // ---------------
  // Fragments
  stroke(-1, trebleWeight);
  strokeWeight(volume);
  for (int i = 0; i < fragments.length; i++) {
    fragments[i].x = myAudioData[5] * 5;
    fragments[i].px = myAudioData[5] * 50;
    fragments[i].py = myAudioData[6] * 5;
    fragments[i].run();
  }
  theta += TWO_PI/frames * 0.35f;

  // ---------------
  // Nucleactor
  pushMatrix();

    colorMode(RGB);
    translate(width/2, height/2);

    // ---------------
    // Nucleus
    noFill();
    noStroke();
    fill(-1, 150);
    for (int i = 0; i < bsize - 1; i += 5) {
      ellipse(0, 0, 5 * rad / i + volume, 5 * rad / i + volume);
    }

    // ---------------
    // Lines
    stroke(-1, trebleWeight); // stroke alpha mapped to treble volume
    for (int i = 0; i < bsize - 1; i += 5) {
      float x = (r) * cos(i * 2 * PI/bsize);
      float y = (r) * sin(i * 2 * PI/bsize);
      float x2 = (r + in.left.get(i) * 40) * cos(i * 2 * PI/bsize);
      float y2 = (r + in.left.get(i) * 40) * sin(i * 2 * PI/bsize);
      strokeWeight(trebleWeight * 0.015f);
      line(x, y, x2, y2);
    }

    // ---------------
    // Points
    beginShape();
      noFill();
      for (int i = 0; i < bsize - 1; i += 32) {
        float x2 = (r + in.left.get(i) * 30) * cos(i * 2 * PI/bsize);
        float y2 = (r + in.left.get(i) * -30) * sin(i * 2 * PI/bsize);
        // println("x2: " + x2 + " " + "y2: " + y2);
        pushStyle();
          stroke(80, 255);
          strokeWeight(5);
          point(x2, y2);
        popStyle();
      }
    endShape();

    // ---------------
    // Arcs
    for (int i = 0; i < arcs.size(); i++) {
      Arc a = (Arc)arcs.get(i);
      a.draw();
    }

  popMatrix();
  // --- End Nucleus -- //

  // ---------------
  // Visualizer
  if (keyPressed) {
    if (key == 'w') {
      showVisualizer = true;
      // generateArcs();
    } else if (key == 'W') {
      showVisualizer = false;
    } else if (key == 's') {
      saveFrame();
    }
  }

  if (showVisualizer) myAudioDataWidget();
}

// ************************************************************************************
// Classes

// Fragment
class Fragment {
  float x, y;
  float px, py, offSet, radius;
  int dir;
  int col;

  Fragment(float _x, float _y) {
    x = _x;
    y = _y;
    offSet = random(TWO_PI);
    radius = random(5, 10);
    dir = random(1) > .5f ? 1 : -1;
  }

  public void run() {
    update();
    showLines();
  }

  public void update() {
    float vari = map(sin(theta + offSet), -1, 1, -2, -2);
    px = map(sin(theta + offSet) , -1, 1, 0, width);
    py = y + sin(theta * dir) * radius * vari;
  }

  public void showLines() {
    for (int i = 0; i < fragments.length; i++) {
      float distance = dist(px, py, fragments[i].px, fragments[i].py);
      if (distance > 0 && distance < 100) {
        // stroke(0, 255);
        line(px, py, fragments[i].px, fragments[i].py);
      }
    }
  }
}

// Arc
class Arc {
  int numTraits, lengthTrait, range, strokeWeight;
  float depart, spaceTrait;
  int c;

  Trait[] traits;
  float[] pos;
  float[] posTarget;

  Arc(int _range) {
    range = _range;
    numTraits = (int)random(10, 50);
    spaceTrait = (int)random(2, 5);
    depart = random(360);
    lengthTrait = (int)random(1, 50);
    strokeWeight = (int)random(1, 10);
    c = color(255);

    traits = new Trait[numTraits];
    pos = new float[numTraits];
    posTarget = new float[numTraits];

    for(int i = 0; i < numTraits; i++) {
      traits[i] = new Trait(i, strokeWeight, lengthTrait, c);
      pos[i] = 0;
      posTarget[i] = depart + i * spaceTrait;
    }
  }

  public void draw() {
    for(int i = 0; i < numTraits; i++) {
      pushMatrix();
        rotate(radians(pos[i]) + (frameCount * 0.025f));
        translate(300 - range * 30, 0);
        traits[i].draw();
      popMatrix();

      pos[i] = posTarget[i];
      if ((i + 1) * spaceTrait > 335) i = numTraits;
    }
  }
}

// Arc Traits
class Trait {
  int id, strokeWeightTarget, lengthTraitTarget, transpTarget;
  float strokeWeight, lengthTrait, transp;
  int c;

  Trait(int _id, int _strokeWeight, int _lengthTrait, int _c) {
    id = _id;
    strokeWeightTarget = _strokeWeight;
    c = _c;
    lengthTraitTarget = _lengthTrait;
    transpTarget = 55;
  }

  public void draw() {
    strokeWeight(strokeWeightTarget);
    stroke(c, trebleWeight * 0.45f);
    line(0, 0, lengthTrait, 0);
    lengthTrait = ease(lengthTrait, lengthTraitTarget, 0.1f);
    transp = ease(transp, transpTarget, 0.7f);
  }
}

// Arc Helpers
public void generateArcs() {
  arcs = new ArrayList<Arc>();

  int numArcs;
  for (int k = 0; k < 2; k++) {
    numArcs = (int)random(3, 9);
    for (int j = 0; j < numArcs; j++) {
      arcs.add(new Arc(j));
    }
  }
}

public float ease(float variable, float target, float easingVal) {
  float d = target - variable;
  if (abs(d) > 1) variable += d * easingVal;
  return variable;
}

// ************************************************************************************
// Audio Data

public void myAudioDataUpdate() {
  for (int i = 0; i < myAudioRange; ++i) {
    float tempIndexAvg = (myAudioFFT.getAvg(i) * myAudioAmp) * myAudioIndexAmp;
    float tempIndexCon = constrain(tempIndexAvg, 0, myAudioMax);
    myAudioData[i]     = tempIndexCon;
    myAudioIndexAmp   += myAudioIndexStep;
    // println(myAudioData);
  }
  myAudioIndexAmp = myAudioIndex;
}

public void myAudioDataWidget() {
  noStroke(); fill(0, 200); rect(0, height - 112, width, 102);
  for (int i = 0; i < myAudioRange; ++i) {
    fill(0xffCCCCCC); rect(10 + (i * 15), (height - myAudioData[i]) - 11, 10, myAudioData[i]);
  }
}

public void stop() {
  myAudio.close();
  minim.stop();
  super.stop();
}

public void settings() {
  fullScreen();
}
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "build" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
