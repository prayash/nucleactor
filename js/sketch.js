// Fragments
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
var octave = 1;
var notes = [ 50, 54, 57, 61, 64, 66, 69 , 73, 76];

// ************************************************************************************

function setup() {
  var myCanvas = createCanvas(windowWidth, windowHeight);
  myCanvas.parent("canvas");
  frameRate(30);
  if (windowWidth > 960) {
    num = 200;
  }

  osc = new p5.SinOsc();
  osc.start();
  osc.amp(0);
  envelope = new p5.Env(0.5, 0.25, 0.5, 0.5);

  reverb = new p5.Reverb();
  reverb.process(osc, 5, 5);

  amplitude = new p5.Amplitude();
  fft = new p5.FFT();

  // Fragments
  for (var i = 0; i < num; i++) {
    var x = random(windowWidth);
    var y = (windowHeight - 2) / (num) * i;
    fragments.push(new Fragment(x, y));
    fragments[i].px = random(windowWidth);
    fragments[i].py = random(windowHeight);
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
  // Nucleactor
  push();
    // ---------------
    // Nucleus
    colorMode(RGB);
    translate(windowWidth/2, windowHeight/2);
    noStroke();

    // Concentrics
    fill(255, 255, 255, 150);
    for (var i = 0; i < 1024 - 1; i += 5) {
      ellipse(0, 0, 5 * rad / i, 5 * rad / i);
    }

    // ---------------
    // Waveform
    stroke(255, volume * 4); // stroke alpha mapped to volume
    for (var i = 0; i < waveform.length - 1; i += 8) {
      var x = (r) * cos(i * 2 * PI/waveform.length);
      var y = (r) * sin(i * 2 * PI/waveform.length);
      var x2 = (r + waveform[i] * 60) * cos(i * 2 * PI/waveform.length);
      var y2 = (r + waveform[i] * 60) * sin(i * 2 * PI/waveform.length);
      strokeWeight(5);
      strokeCap(SQUARE);
      line(x, y, x2, y2);
    }

    // ---------------
    // Points + Connectors
    beginShape();
      noFill();
      for (var i = 0; i < waveform.length; i += 32) {
        var x2 = (r + waveform[i] * 30) * cos(i * 2 * PI / waveform.length);
        var y2 = (r + waveform[i] * 30) * sin(i * 2 * PI / waveform.length);
        var x2 = r * cos(i * 2 * PI / 1024);
        var y2 = r * sin(i * 2 * PI / 1024);
        push();
          stroke(255, 150);
          strokeWeight(7.5);
          if (i < waveform.length) point(x2, y2);
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

  // This needs to be a class..
  // var xPos = floor(map(touchX, 0, windowWidth / notes.length, 0, windowWidth)); 
  // rect(touchX, 0, windowWidth / notes.length, windowHeight);


}

// function touchMoved() {
  // line(touchX, touchY, ptouchX, ptouchY);
//   var key = floor(map(touchX, 0, windowWidth, 0, notes.length));
//   playNote(notes[key]);
// }

// function touchStarted() {
//   var key = floor(map(touchX, 0, windowWidth, 0, notes.length));
//   playNote(notes[key]);
// }

// function touchEnded() {
//   osc.fade(0, 0.5);
// }

function keyPressed() {
  console.log(keyCode);
  switch(keyCode) {
    case 65:
      playNote(notes[0]);
      break;
    case 83:
      playNote(notes[1]);
      break;
    case 68:
      playNote(notes[2]);
      break;
    case 70:
      playNote(notes[3]);
      break;
    case 71:
      playNote(notes[4]);
      break;
    case 72:
      playNote(notes[5]);
      break;
    case 74:
      playNote(notes[6]);
      break;
    case 75:
      playNote(notes[7]);
      break;
    case 76:
      playNote(notes[8]);
      break;
  }
}

function keyReleased() {
  console.log(keyCode);
  switch(keyCode) {
    case 65:
      playNote(notes[0]);
      break;
    case 83:
      playNote(notes[1]);
      break;
    case 68:
      playNote(notes[2]);
      break;
    case 70:
      playNote(notes[3]);
      break;
    case 71:
      playNote(notes[4]);
      break;
    case 72:
      playNote(notes[5]);
      break;
    case 74:
      playNote(notes[6]);
      break;
    case 75:
      playNote(notes[7]);
      break;
    case 76:
      playNote(notes[8]);
      break;
    osc.fade(0,0.5);
  }
}

function keyReleased() {
  // osc.fade(0,0.5);
}

// A function to play a note
function playNote(note) {
  osc.freq(midiToFreq(note));
  // osc.fade(0.5, 0.2);
  envelope.play(osc);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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
    this.display();
  };
 
  this.update = function() {
    var vari = map(sin(theta + offSet), -1, 1, -2, -2);
    px = map(sin(theta + offSet) , -1, 1, 0, width);
    py = this.y + sin(theta * dir) * radius * vari;
  }
 
  this.display = function() {
    for (var i = 0; i < fragments.length; i++) {
      var distance = dist(px, py, fragments[i].px, fragments[i].py);

      if (distance > 0 && distance < 75) {
        strokeCap(ROUND);
        line(px, py, fragments[i].px, fragments[i].py);
        // ellipse(px, py, 5, 5);
        // ellipse(fragments[i].px, fragments[i].py, 10, 10);
      }
    }
  }
}

// Pulse
function pulse(touchX) {
  this.x = touchX;
  this.lifespan = 255;

  this.run = function() {
    this.update();
    this.display();
  }

  this.update = function () {
    this.lifespan--;
  }

  this.display = function() {
    fill(255);
    rect(this.x, 0, 50, windowHeight);
  }
}