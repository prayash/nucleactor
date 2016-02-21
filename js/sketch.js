// Nucleactor by Prayash Thapa (effulgence.io)
// ************************************************************************************

var CLIENT_ID       = "188bdc288184c969c82a24af4145c999";
var TRACK_URL       = "http://soundcloud.com/effulgence/transience";
var BUFFER_SIZE     = 1024;

var num             = 100
var frames          = 480;
var theta           = 0;

var colorCounter    = 0;
var rad             = 150;
var r               = 200;

var streamUrl, theTrack, controls;
var volume, subWeight, trebleWeight;
var button, input;

var fragments = [], arcs = [];

// ************************************************************************************
// * Preload

function preload() {
  showLoading();
  SC.initialize({ client_id: CLIENT_ID });
  SC.resolve(TRACK_URL).then(afterLoad).catch(function(error) { console.log(error); });
}

function afterLoad(track) {
  streamUrl = track.stream_url + '?client_id=' + CLIENT_ID;
  theTrack = loadSound(streamUrl, function(loadedTrack) { theTrack.play(); doneLoading(); });
}

function loadTrack(url) {
  theTrack.stop();
  showLoading();

  var trackUrl = input.value();
  SC.initialize({ client_id: CLIENT_ID });
  SC.resolve(trackUrl).then(afterLoad).catch(function(error) { console.log(error); });
}

// ************************************************************************************
// * Setup

function setup() {
  var myCanvas = createCanvas(displayWidth, displayHeight);
  myCanvas.parent('canvas');
  createControls();

  fft = new p5.FFT(1.0, BUFFER_SIZE);
  amplitude = new p5.Amplitude();

  // Fragments
  for (var i = 0; i < num; i++) {
    var x = random(width);
    var y = (height - 2) / (num) * i;
    fragments.push(new Fragment(x, y));
    fragments[i].px = random(width);
    fragments[i].py = random(height);
  }

  generateArcs();
}

// ************************************************************************************
// * Draw

function draw() {
  // * Analysis Parameters
  var spectrum = fft.analyze();
  var waveform = fft.waveform();
  volume = map((amplitude.getLevel() * 255), 0, 255, 0, 10);
  trebleWeight = fft.getEnergy("treble");
  // console.log(trebleWeight);

  // * Derived Parameters
  var gradientVariance = map(volume, 0, 25, 0, 25);

  // ***********************************************
  // * Background
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
    fill(12.5 * cos((colorCounter * 0.025 ) / 100.0) + 62.5, 1, 1);
    vertex(width, height);

    // Reds + Purples
    fill(12.5 * sin((colorCounter + gradientVariance * 0.25 ) / 200.0) + 87.5, 1, 1);
    vertex(-width, height);

  endShape();
  colorCounter += gradientVariance;
  // ***********************************************

  // * Fragments
  stroke(255, volume / 2);
  strokeWeight(volume);
  for (var i = 0; i < fragments.length; i++) fragments[i].run();
  theta += TWO_PI/frames * 0.35 * (volume / 2);

  // - Nucleactor
  push();
    colorMode(RGB);
    translate(windowWidth/2, windowHeight/2);

    // * Epicenter
    noFill();
    noStroke();
    fill(255, 150);
    for (var i = 0; i < waveform.length - 1; i += 5) ellipse(0, 0, 5 * rad / i + volume * 25, 5 * rad / i + volume * 25);

    // * Waveform
    stroke(255, volume * 20);
    for (var i = 0; i < waveform.length - 1; i += 8) {
      var x = (r) * sin(i * 2 * PI/waveform.length);
      var y = (r) * cos(i * 2 * PI/waveform.length);
      var x2 = (r + waveform[i] * 80) * sin(i * 2 * PI/waveform.length);
      var y2 = (r + waveform[i] * 80) * cos(i * 2 * PI/waveform.length);
      strokeWeight(volume * 15);
      strokeCap(SQUARE);
      line(x, y, x2, y2);
    }

    // * Points
    beginShape();
      noFill();
      for (var i = 0; i < waveform.length; i += 32) {
        var x2 = (r + waveform[i] * 50) * cos(i * 2 * PI / waveform.length);
        var y2 = (r + waveform[i] * -50) * sin(i * 2 * PI / waveform.length);
        push();
          stroke(255, 100);
          strokeWeight(5);
          if (i < waveform.length) point(x2, y2);
        pop();
      }
    endShape();

    // * Concentrism
    stroke(255, volume * 35);
    for (var i = 0; i < arcs.length; i++) arcs[i].draw();

  pop();
}

// ************************************************************************************

// * Fragment
function Fragment(_x, _y) {
  var x, y;
  var px, py, offSet, radius;
  var dir;
  var col; var currentOrb;
  var randRadius = random(2, 10);

  this.x = _x;
  this.y = _y;
  offSet = random(TWO_PI);
  radius = random(5, 10);
  dir = random(1) > 0.5 ? 1 : -1;

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
      if (distance > 25 && distance < 110) {
        line(px, py, fragments[i].px, fragments[i].py);
        if (random(1) > 0.8 && volume < 2) {
          fill(255, volume / 1.5);
          ellipse(px, py, randRadius, randRadius);
        }
      }
    }
  }
}

// * Arc
function Arc(_range) {
  var numTraits, lengthTrait, range, strokeWeight, depart, spaceTrait, c;
  var traits = [], pos = [], posTarget = [];

  this.range = _range;
  numTraits = random(10, 50);
  spaceTrait = random(2, 5);
  depart = random(360);
  lengthTrait = random(1, 50);
  strokeWeight = random(1, 10);
  c = 255;

  traits = [numTraits];
  pos = [numTraits];
  posTarget = [numTraits];

  for(var i = 0; i < numTraits; i++) {
    traits[i] = new Trait(i, strokeWeight, lengthTrait, c);
    pos[i] = 0;
    posTarget[i] = depart + i * spaceTrait;
  }

  this.draw = function() {
    for(var i = 0; i < numTraits; i++) {
      push();
        rotate(radians(pos[i]) + (frameCount * 0.025));
        translate(300 - (this.range * 30 / volume), 0);
        traits[i].draw();
      pop();

      pos[i] = posTarget[i];
      if ((i + 1) * spaceTrait > 335) i = numTraits;
    }
  }
}

// * Arc Traits
function Trait(_id, _strokeWeight, _lengthTrait, _c) {
  var id, strokeWeightTarget, lengthTraitTarget, transpTarget;
  var lengthTrait = 0, transp;
  var c;

  this.id = _id;
  this.strokeWeightTarget = _strokeWeight;
  this.c = _c;
  this.lengthTraitTarget = _lengthTrait;
  transpTarget = 55;

  this.draw = function() {
    strokeWeight(this.strokeWeightTarget);
    stroke(this.c, this.volume * 30);
    line(0, 0, lengthTrait, 0);
    lengthTrait = ease(lengthTrait, this.lengthTraitTarget, 0.1);
    transp = ease(transp, transpTarget, 0.7);
  }
}

// * Arc Helpers
var generateArcs = function() {
  arcs = [];

  var numArcs;
  for (var k = 0; k < 2; k++) {
    numArcs = Math.floor(random(3, 9));
    for (var j = 0; j < numArcs; j++) {
      arcs.push(new Arc(j));
    }
  }
}

var ease = function(variable, target, easingVal) {
  var d = target - variable;
  if (abs(d) > 1) variable += d * easingVal;
  return variable;
}

// ************************************************************************************

function windowResized() {
  resizeCanvas(displayWidth, displayHeight);
}

function showLoading() {
  var element = document.getElementById('loading');
  var style = element.style;
  style.opacity = "1";
}

function doneLoading() {
  var element = document.getElementById('loading');
  var style = element.style;
  style.opacity = "0";
}

function keyPressed(e) {
  switch(keyCode) {
    case 32:
      e.preventDefault();
      toggleControls();
      break;
    case 70:
      e.preventDefault();
      var fs = fullScreen();
      fullScreen(!fs);
  }
}

function createControls() {
  controls = true;
  input = createInput("https://soundcloud.com/effulgence/an-arrival");
  input.position(10, 10);

  button = createButton('GO');
  button.position(280, 10);
  button.mousePressed(loadTrack);
}

function toggleControls() {
  if (controls) {
    controls = false;
    input.style('opacity', '0');
    button.style('opacity', '0');
  } else {
    controls = true;
    input.style('opacity', '1');
    button.style('opacity', '1');
  }
}
