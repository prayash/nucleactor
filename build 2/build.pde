import ddf.minim.*;
import ddf.minim.analysis.*;
// import themidibus.*;

Minim         minim;
AudioPlayer   myAudio;
AudioInput		in;
// MidiBus 			myBus;
FFT           myAudioFFT;


float 				soundWeight;
boolean       showVisualizer   = false;

int           myAudioRange     = 11;
int           myAudioMax       = 100;

float         myAudioAmp       = 40.0;
float         myAudioIndex     = 0.2;
float         myAudioIndexAmp  = myAudioIndex;
float         myAudioIndexStep = 0.35;

float[]       myAudioData      = new float[myAudioRange];

// ************************************************************************************

HDrawablePool pool;
int           poolMax          = 10;

// ************************************************************************************

void setup() {
	size(700, 700);
	H.init(this).background(#202020).autoClear(false);

	// MidiBus.list(); // List all available Midi devices on STDOUT. This will show each device's index and name.

 //  // or for testing you could ...
 //  //                 Parent  In        Out
 //  //                   |     |          |
 //  myBus = new MidiBus(this, "visuals", -1); // Create a new MidiBus class with no input device and the "visuals" port as the output device.

	minim   = new Minim(this);
	myAudio = minim.loadFile("HECQ_With_Angels_Trifonic_Remix.wav");
	myAudio.loop();
	myAudio.setGain(0.01);
	in = minim.getLineIn();

	myAudioFFT = new FFT(myAudio.bufferSize(), myAudio.sampleRate());
	myAudioFFT.linAverages(myAudioRange);
	myAudioFFT.window(FFT.GAUSS);

	pool = new HDrawablePool(poolMax);
	pool.autoAddToStage()
		.add ( new HRect(100).rounding(10) )
		.onCreate (
			new HCallback() {
				public void run(Object obj) {
					int ranIndex = (int)random(myAudioRange);

					HDrawable d = (HDrawable) obj;
					d
						.stroke(0)
						.fill(255, 225)
						.anchorAt(H.CENTER)
						.rotation(45)
						.loc( (int)random(width), (int)random(height) )
						.extras( new HBundle().num("i", ranIndex) )
					;
				}
			}
		)
		.requestAll()
	;
}

void draw() {
	myAudioFFT.forward(myAudio.mix);
	myAudioDataUpdate();

	H.drawStage();

	for (HDrawable d : pool) {
		HBundle tempExtra = d.extras();
		int i = (int)tempExtra.num("i");

		int fftFillColor = (int)map(myAudioData[i], 0, myAudioMax, 0, 255);
		int fftSize      = (int)map(myAudioData[i], 0, myAudioMax, 0, 300);
		int soundWeight	 = (int)map((in.mix.level() * 100), 0, myAudioMax, 0, 255);
		println(soundWeight);

		d.fill(int(soundWeight), 225).size(soundWeight);
	}

	if (showVisualizer) myAudioDataWidget();
}

void myAudioDataUpdate() {
	for (int i = 0; i < myAudioRange; ++i) {
		float tempIndexAvg = (myAudioFFT.getAvg(i) * myAudioAmp) * myAudioIndexAmp;
		float tempIndexCon = constrain(tempIndexAvg, 0, myAudioMax);
		myAudioData[i]     = tempIndexCon;
		myAudioIndexAmp+=myAudioIndexStep;
	}
	myAudioIndexAmp = myAudioIndex;
}

void myAudioDataWidget() {
	// noLights();
	// hint(DISABLE_DEPTH_TEST);
	noStroke(); fill(0,200); rect(0, height-112, width, 102);
	for (int i = 0; i < myAudioRange; ++i) {
		fill(#CCCCCC); rect(10 + (i*5), (height-myAudioData[i])-11, 4, myAudioData[i]);
	}
	// hint(ENABLE_DEPTH_TEST);
}

void stop() {
	myAudio.close();
	minim.stop();  
	super.stop();
}

// ************************************************************************************

// int scene=0; // Keep track of the current scene
// int shape=0; // and shape

// color backgroundCol=0; // Store the background color
// color strokeCol=255; // Store the shape outile color

// float soundWeight; // Store the sound volume weight

// void setup() { // Setup function runs only once when the sketch starts. Initialize everything here
//   size(1280, 768); // Set the window size
  
//   noFill(); // Will draw only outline of shapes
//   rectMode(CENTER); // Set the rectangle origin to its center
//   colorMode(HSB, 360, 100, 100); // Set the color values to Hue Saturation Brightness instead of Red Green Blue
//   smooth(8); // Draw smooth shapes
  
//   MidiBus.list(); // List all available Midi devices on STDOUT. This will show each device's index and name.

//   // or for testing you could ...
//   //                 Parent  In        Out
//   //                   |     |          |
//   myBus = new MidiBus(this, "visuals", -1); // Create a new MidiBus class with no input device and the "visuals" port as the output device.

//   minim = new Minim(this); // Create a new Minim class for sound input
//   in = minim.getLineIn();  // Enable 
// }

// void draw() { // Draw function runs every frame. Update everything and draw on the screen
//   soundWeight=in.mix.level()*5; // Read the audio input and scale the value
//   drawScene(); // Draw the visuals
// }

// void noteOn(int channel, int pitch, int velocity) { // NoteOn function only runs when a Note On message is recieved
//   //Receive a noteOn and trigger events
  
//   //println();  // uncomment to see all the incoming messages
//   //println("Note On:");
//   //println("--------");
//   //println("Channel:"+channel);
//   //println("Pitch:"+pitch);
//   //println("Velocity:"+velocity);
  
//   if((channel==0)&&(pitch==60)){ // Kick note will change colors
//     randomColors();
//   }else if((channel==0)&&(pitch==62)){ // Snare note will sellect the next shape
//     shape++;
//   }else if((channel==0)&&(pitch==0)){ // Move to the next scene
//     scene++;
//   }else if((channel==0)&&(pitch==1)){ // Move to the previouc scene
//     scene--;
//   }
// }

// void noteOff(int channel, int pitch, int velocity) { // NoteOff function only runs when a Note Off message is recieved
//   // trigger any events on note off
// }

// void drawScene(){ // A function we use to draw different things according to the current scene
//   switch(scene){ // We only have 4 scenes here
//     case 0:
//       background(0); // set the background black
//       break;
//     case 1:
//       background(backgroundCol); // just draw the background with its color
//       break;
//     case 2:
//       drawShapes(0); //draw static shapes over the background
//       break;
//     case 3:
//       drawShapes(soundWeight); //draw shapes that scale to the incoming volume levels. We pass the sound weight as the size value
//       break;
//   }
// }

// void randomColors(){ // A function we use to change randomly the colors
//     backgroundCol=color(random(127,255),50,50); // Set a random color for the background with a hue from 127 to 255
//     strokeCol=color(random(0,126),100,100);; // Set a random color for the outlines with a hue from 0 to 126
// }

// void drawShapes(float size){ // A function we use to draw a shape according to the current shape
//   background(backgroundCol); // First draw the background
//   stroke(strokeCol); // Set the outline color
//   pushMatrix();
//   translate(width/2,height/2); // Start drawing from the center of the screen
    
//   switch(shape%3){ // We only have 3 shapes so lets sycle through them. We add the size value
//     case 0: 
//       rect(0,0,width/4+size*width/8,width/4+size*width/8); // Draw a square
//       break;
//     case 1:
//       ellipse(0,0,width/4+size*width/8,width/4+size*width/8); // Draw a circle
//       break;
//     case 2:
//       triangle(-width/8-size*width/16,width/8+size*width/16,0,-width/8-size*width/16,width/8+size*width/16,width/8+size*width/16); // Draw a triangle
//       break;
//   }
//   popMatrix();
// }


