import ddf.minim.*;
import ddf.minim.analysis.*;

Minim         minim;
AudioPlayer   myAudio;
AudioInput		in;
FFT           myAudioFFT;


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

void setup() {
	size(700, 700, P3D);
	H.init(this).background(#000000).use3D(true).autoClear(true);

	canvasBottom = new HCanvas(700, 700, P3D).autoClear(false).fade(2);
	// H.add(canvasBottom);

	minim   = new Minim(this);
	in = minim.getLineIn(); // getLineIn(type, bufferSize, sampleRate, bitDepth);

	// Fast Fourier Transform
	myAudioFFT = new FFT(in.bufferSize(), in.sampleRate());
	println("bufferSize: " + in.bufferSize() + " . . . " + "sampleRate: " + in.sampleRate());
	myAudioFFT.linAverages(myAudioRange);
	myAudioFFT.window(FFT.GAUSS);

	// Swarm
	swarm = new HSwarm()
		.speed(4)
		.turnEase(0.025f)
		.twitch(20)
		.addGoal((int)(random(0, 700)), (int)(random(0, 700)), (int)(random(0, 700)))
	;

	// Orbs
	orbPool = new HDrawablePool(poolCols * poolRows);
	orbPool.autoAddToStage()
		.add ( new HSphere() )
		.onCreate (
			new HCallback() {
				public void run(Object obj) {
					HSphere d = (HSphere) obj;
					d
						.size(10)
						.loc((int)(random(0, 700)), (int)(random(0, 700)), (int)(random(0, 700)))
						.strokeWeight(0)
						.noStroke()
						.fill(255, int(random(50, 200)))
						.anchorAt(H.CENTER)
					;
					swarm.addTarget(d);
				}
			}
		)
		.requestAll()
	;

	// Rectangles
	rectPool = new HDrawablePool(poolCols * poolRows * poolDepth);
	rectPool.autoAddToStage()
		.add (new HRect(100).rounding(5))
		.layout (new HGridLayout().startX(-300).startY(-300).startZ(-300).spacing(150, 150, 150).rows(poolRows).cols(poolCols))
		// .layout (new HGridLayout().startX(110).startY(110).spacing(80, 80).cols(poolCols))
		.onCreate (
			new HCallback() {
				public void run(Object obj) {
					int ranIndex = (int)random(myAudioRange);

					HDrawable d = (HDrawable) obj;
					d
						.noStroke()
						.fill(palette[ranIndex], 225)
						.anchorAt(H.CENTER)
						// .rotation(45)
						.z(-600)
						.extras( new HBundle().num("i", ranIndex) )
					;
				}
			}
		)
		.requestAll()
	;
}

void draw() {
	myAudioFFT.forward(in.mix);
	myAudioDataUpdate();

	pushMatrix();
		translate(width/2, height/2, -500);

		rotateX( map(rotateNumX, 0, myAudioMax, -(TWO_PI / 20), TWO_PI / 20) );
		rotateY( map(rotateNumY, 0, myAudioMax, -(TWO_PI / 20), TWO_PI / 20) );
		rotateZ( map(rotateNumZ, 0, myAudioMax, -(TWO_PI / 20), TWO_PI / 20) );

		int fftRotateX = (int)map(myAudioData[0], 0, myAudioMax, -1,  20);
		int fftRotateY = (int)map(myAudioData[3], 0, myAudioMax, -1,  20);
		int fftRotateZ = (int)map(myAudioData[5], 0, myAudioMax,  1, -20);

		rotateNumX += fftRotateX;
		rotateNumY += fftRotateY;
		rotateNumZ += fftRotateZ;

		H.drawStage();
	popMatrix();

	// Audio Processing

	for (HDrawable d : rectPool) {
		HBundle tempExtra = d.extras();
		int i = (int)tempExtra.num("i");

		int fftZ = (int)map(myAudioData[i], 0, myAudioMax, -500, 100);
		int soundWeight	 = (int)map((in.mix.level() * 10), 0, 10, -600, 100);
		d.z(fftZ);

		// color newColor = (oldColor & 0xffffff) | (newAlpha << 24); 

		// println("Input: " + in.mix.level() + " . . . ." + "soundWeight: " + soundWeight);
		// println(fftZ);
	}

	if (showVisualizer) myAudioDataWidget();
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