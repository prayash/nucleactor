var num = 50, frames = 300, edge = 40;
var fragments = [];
var theta = 0;
var colorCounter = 0;
var rad = 150;
var r = 150;

// Synthesis
var osc;
var envelope;
var amplitude;
var reverb;
var delay;
var notes = [ 50, 54, 57, 61, 64, 66, 69 ];

// ************************************************************************************

function setup() {
  var myCanvas = createCanvas(displayWidth, displayHeight);
  myCanvas.parent("canvas");

  osc = new p5.SinOsc();
  osc.start();
  osc.amp(0);
  envelope = new p5.Env(0.0075, 0.2, 1, 1);

  delay = new p5.Delay();
  delay.process(osc, 0.3, .3, 20000);

  reverb = new p5.Reverb();
  reverb.process(delay, 5, 7.5);
  reverb.amp(4);

  amplitude = new p5.Amplitude();
  fft = new p5.FFT();

  // Fragments
  for (var i = 0; i < num; i++) {
    var x = random(displayWidth);
    var y = (displayHeight - 2) / (num) * i;
    fragments.push(new Fragment(x, y));
    fragments[i].px = random(displayWidth);
    fragments[i].py = random(displayHeight);
  }
}

// ************************************************************************************

function draw() {
  
  // Analysis Parameters
  var spectrum = fft.analyze();
  var waveform = fft.waveform();
  var volume = map((amplitude.getLevel() * 255), 0, 255, 0, 255);

  // Derived Parameters
  var gradientVariance = map(volume, 0, 10, 0, 1);
  
  // *********************************
  // Background
  fill(0);
  colorMode(HSB, 100, 1, 1);
  noStroke();
  beginShape();

    // Yellows and Reds
    fill(12.5 * sin((colorCounter + gradientVariance * 0.025) / 100.0) + 12.5, 0.75, 1);
    vertex(-width, -height);
    
    // Yellows and Whites
    fill(12.5 * cos((colorCounter - gradientVariance * 0.025 ) / 200.0) + 37.5, 0.5, 1);
    vertex(width, -height);

    // Blues and Greens
    fill(12.5 * cos((colorCounter * 0.025 ) / 100.0) + 62.5, 0.75, 1);
    vertex(width, height);
    
    // Reds + Purples
    fill(12.5 * sin((colorCounter + gradientVariance * 0.25 ) / 200.0) + 87.5, 0.75, 1);
    vertex(-width, height);

  endShape();
  colorCounter += gradientVariance;

  // *********************************

  // ---------------
  // Waveform
  noFill();
  beginShape();
    stroke(255, volume); // waveform is red
    strokeWeight(1);
    for (var i = 0; i < waveform.length; i++){
      var x = map(i, 0, waveform.length, 0, width);
      var y = map(waveform[i], -1, 1, 0, height);
      // vertex(x, y);
    }
  endShape();

  // ---------------
  // Nucleactor
  push();
    // ---------------
    // Nucleus
    colorMode(RGB);
    translate(displayWidth/2, displayHeight/2);
    noStroke();

    // Concentrics
    fill(255, 255, 255, 150);
    for (var i = 0; i < 1024 - 1; i += 5) {
      ellipse(0, 0, 5 * rad / i, 5 * rad / i);
    }

    // ---------------
    // Lines -- not functioning currently
    stroke(-1, volume / 2); // stroke alpha mapped to volume
    for (var i = 0; i < 1024 - 1; i += 5) {
      var x = (r) * cos(i * 2 * PI/1024);
      var y = (r) * sin(i * 2 * PI/1024);
      var x2 = (r + amplitude.getLevel[0]) * cos(i * 2 * PI/1024);
      var y2 = (r + amplitude.getLevel[0]) * sin(i * 2 * PI/1024);
      strokeWeight(volume * 0.0125);
      line(x, y, x2, y2);
    }

    // ---------------
    // Points + Connectors
    beginShape();
      noFill();
      stroke(255, volume + 150);
      for (var i = 0; i <= 1024; i += 32) {
        var x2 = r * cos(i * 2 * PI / 1024);
        var y2 = r * sin(i * 2 * PI / 1024);
        vertex(x2, y2);
        push();
          strokeWeight(7.5);
          if (i < 1024) point(x2, y2);
        pop();
      }
    endShape();
  pop();
  // --- End Nucleus -- //

  // ---------------
  // Fragments
  colorMode(RGB); // Reset colorMode
  noFill();
  stroke(255, volume * 2);
  strokeWeight(2);
  for (var i = 0; i < fragments.length; i++) {
    fragments[i].run();
  }
  theta += TWO_PI/frames * (volume * 0.0025); // speed
  
}

// function touchMoved() {
//   // line(touchX, touchY, ptouchX, ptouchY);
// }

function touchStarted() {
  var key = floor(map(touchX, 0, displayWidth, 0, notes.length));
  playNote(notes[key]);
}

function touchEnded() {
  osc.fade(0, 0.5);
}

// A function to play a note
function playNote(note) {
  osc.freq(midiToFreq(note));
  envelope.play(osc);
}

// ************************************************************************************
// Classes

// Fragment
function Fragment(_x, _y) {
  var x, y;
  var px, py, offSet, radius;
  var dir;
  var col; var currentOrb;

  this.x = _x;
  this.y = _y;
  offSet = random(TWO_PI);
  radius = random(5, 10);
  dir = random(1) > .5 ? 1 : -1;
 
  this.run = function() {
    this.update();
    this.showLines();
  };
 
  this.update = function() {
    var vari = map(sin(theta + offSet), -1, 1, -2, -2);
    px = map(sin(theta + offSet) , -1, 1, 0, width);
    py = this.y + sin(theta * dir) * radius * vari;
  }
 
  this.showLines = function() {
    for (var i = 0; i < fragments.length; i++) {
      var distance = dist(px, py, fragments[i].px, fragments[i].py);

      if (distance > 0 && distance < 75) {
        line(px, py, fragments[i].px, fragments[i].py);
        // ellipse(px, py, 5, 5);
        // ellipse(fragments[i].px, fragments[i].py, 10, 10);
      }
    }
  }
}