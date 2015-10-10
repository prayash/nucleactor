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

HDrawablePool pool;
int           poolCols         = 7;
int           poolRows         = 7;

//                                v BASE = orange            v SNARE = blue
color[]       palette          = {#FF3300, #FF620C, #FF9519, #0095A8, #FFC725, #F8EF33, #FFFF33, #CCEA4A, #9AD561, #64BE7A, #2EA893};

// ************************************************************************************

void setup() {
	size(700, 700, P3D);
	H.init(this).background(#000000).use3D(true).autoClear(true);

	minim   = new Minim(this);
	in = minim.getLineIn(); // getLineIn(type, bufferSize, sampleRate, bitDepth);

	// Fast Fourier Transform on incoming audio input
	myAudioFFT = new FFT(in.bufferSize(), in.sampleRate());
	println("bufferSize: " + in.bufferSize() + " . . . " + "sampleRate: " + in.sampleRate());
	myAudioFFT.linAverages(myAudioRange);
	myAudioFFT.window(FFT.GAUSS);

	pool = new HDrawablePool(poolCols * poolRows);
	pool.autoAddToStage()
		.add ( new HRect(100).rounding(5) )
		.layout (new HGridLayout().startX(110).startY(110).spacing(80, 80).cols(poolCols))
		.onCreate (
			new HCallback() {
				public void run(Object obj) {
					int ranIndex = (int)random(myAudioRange);

					HDrawable d = (HDrawable) obj;
					d
						.noStroke()
						.fill(palette[ranIndex], 225)
						.anchorAt(H.CENTER)
						.rotation(45)
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

	H.drawStage();

	for (HDrawable d : pool) {
		HBundle tempExtra = d.extras();
		int i = (int)tempExtra.num("i");

		int fftZ = (int)map(myAudioData[i], 0, myAudioMax, -600, 100);
		int soundWeight	 = (int)map((in.mix.level() * 10), 0, 10, -600, 100);
		d.z(fftZ);

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