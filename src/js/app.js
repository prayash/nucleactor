// Nucleactor by Prayash Thapa (effulgence.io)
// ************************************************************************************

var CLIENT_ID       = "188bdc288184c969c82a24af4145c999";
var TRACK_URL       = "https://soundcloud.com/effulgence/distance-3";
var BUFFER_SIZE     = 1024;

var num             = 90;
var frames          = 480;
var theta           = 0;
var dispScalar      = 10;

var colorCounter    = 0;
var rad             = 150;
var r               = 200;

var streamUrl, theTrack, controls;
var spectrum, waveform, volume, lows, mids, highs;
var hud, button, input, text, trackInfo;

var fragments = [], arcs = [];
var loadingBar = new Mprogress({ template: 3, parent: '#canvas', speed: 0.25, easing: 0.25 });

// ************************************************************************************
// * Preload Audio

function preload() {
  showLoading();
  SC.initialize({ client_id: CLIENT_ID });
  SC.resolve(TRACK_URL).then(afterLoad).catch(function(error) {
    console.log(error);
    console.log("Loading locally.");
    theTrack = loadSound('distance.mp3', function() {
      theTrack.play();
      doneLoading();
      toggleControls();
    });
  });
}

function afterLoad(track) {
  streamUrl = track.stream_url + '?client_id=' + CLIENT_ID;
  theTrack = loadSound(streamUrl, function(loadedTrack) { theTrack.play(); doneLoading(); displayInfo(track); });
}

function loadTrack() {
  theTrack.stop();
  showLoading();
  trackInfo.remove();

  var trackUrl = input.value;
  SC.resolve(trackUrl).then(afterLoad).catch(function(error) {
    console.log(error);
    if (error.status === 403) alert("Error: " + "The owner of this track doesn't allow 3rd party streaming. Try another track!");
  });
}

// ************************************************************************************
// * Setup

function setup() {
  frameRate(24);
  var myCanvas = createCanvas(displayWidth, displayHeight);
  myCanvas.parent('canvas');
  createControls();

  // * User Agent Detection
  if(navigator.userAgent.match(/iPhone|iPad|iPod|Android/ig)) {
    console.log("Mobile version.");
    pixelDensity(1);
    num = 45;
    dispScalar = 4;
  }

  fft = new p5.FFT();
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
  spectrum = fft.analyze();
  waveform = fft.waveform();

  volume = map((amplitude.getLevel() * 255), 0, 255, 0, 10);
  lows = map(fft.getEnergy('bass'), 0, 255, 0, 10);
  mids = map(fft.getEnergy('mid'), 0, 255, 0, 10);
  highs = map(fft.getEnergy('treble'), 0, 255, 0, 10);
  // console.log("Lows: %i " + "Mids: %i " + "Highs: %i ", lows, mids, highs);

  // * Derived Parameters
  var gradientVariance = map(volume, 0, 25, 0, 50);

  // ***********************************************
  // * Background
  fill(0);
  colorMode(HSB, 100, 1, 1);
  noStroke();
  beginShape();
    // Yellows and Reds
    fill(12.5 * sin((colorCounter + (highs * 5) + gradientVariance * 0.25 ) / 100.0) + 12.5, 1, 1);
    vertex(-width, -height);

    // Yellows and Whites
    fill(12.5 * cos((colorCounter - gradientVariance * 0.25 ) / 200.0) + 37.5, 1, 1);
    vertex(width, -height);

    // Blues and Greens
    fill(12.5 * cos((colorCounter * (lows * 5) + 0.025 ) / 100.0) + 62.5, 1, 1);
    vertex(width, height);

    // Reds + Purples
    fill(12.5 * sin((colorCounter + (mids * 5) + gradientVariance * 0.25 ) / 200.0) + 87.5, 1, 1);
    vertex(-width, height);

  endShape();
  colorCounter += gradientVariance;
  // ***********************************************

  // * Fragments
  stroke(255, volume / 2);
  strokeWeight(volume / 1.5);
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
    stroke(255, (volume * 20 + lows * 5));
    for (var i = 0; i < waveform.length - 1; i += 2) {
      var x = (r) * sin(i * 2 * PI/waveform.length);
      var y = (r) * cos(i * 2 * PI/waveform.length);
      var x2 = (r + waveform[i] * 80) * sin(i * 2 * PI/waveform.length);
      var y2 = (r + waveform[i] * 80) * cos(i * 2 * PI/waveform.length);
      strokeWeight(2);
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
    if (volume < 0.5 && random(1) > 0.8) generateArcs();

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
      if (distance > 25 && distance < displayWidth / dispScalar) {
        line(px, py, fragments[i].px, fragments[i].py);
        if (random(1) > 0.8 && volume < 2) {
          fill(255, volume / 1.5);
          ellipse(px, py, randRadius, randRadius);
        }
      }
    }
  }
}

// ************************************************************************************

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
  var strokeWeightTarget, lengthTraitTarget, transpTarget;
  var lengthTrait = 0, transp; var c;

  this.id = _id;
  this.strokeWeightTarget = _strokeWeight;
  this.c = _c;
  this.lengthTraitTarget = _lengthTrait;
  transpTarget = 55;

  this.draw = function() {
    strokeWeight(this.strokeWeightTarget);
    stroke(this.c, this.volume * 30);
    if (random(1) > 0.98) line(0, 0, 30, 0);
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

// * Utilitarian Helpers
// ************************************************************************************

function windowResized() {
  resizeCanvas(displayWidth, displayHeight);
}

function displayInfo(track) {
  trackInfo = createP("Now playing... <br>" + '<strong>' + track.title + " by " + track.user.username + '</strong>');
  trackInfo.parent('hud');
  trackInfo.addClass('nowPlaying');
  trackInfo.style('font-size', '2em');
  trackInfo.style('padding-bottom', '0.75em');
}

function showLoading() {
  var element = document.getElementById('loading');
  var style = element.style;
  style.opacity = "1";
  loadingBar.start();
}

function doneLoading() {
  var element = document.getElementById('loading');
  var style = element.style;
  style.opacity = "0";
  loadingBar.end();
}

function createControls() {
  controls = true;
  hud = document.getElementById('hud');
  input = document.getElementById('trackInput');
  input.value = "https://soundcloud.com/upscale-recordings/raine-clockvice-wonderful";
  button = document.getElementById('goButton');

  text = createP('<strong>Nucleactor</strong> is an audio visualizer created by Prayash Thapa (<strong><a href="http://effulgence.io" target="_blank">effulgence.io</a></strong>).<br>Chrome / Firefox recommended! Click anywhere for FULLSCREEN.');
  text.parent('hud');
  text.addClass('nowPlaying');
  text.style('bottom', '20px !important');
  text.style('font-size', '1em');
}

function toggleControls() {
  if (controls) {
    controls = false;
    hud.className = " "; hud.className += " hide";
  } else {
    controls = true;
    hud.className = " "; hud.className += " show";
  }
}

// * Events
// ************************************************************************************

function mousePressed() {
  if (mouseY > 50 && mouseY < windowHeight - 100) {
    var fs = fullscreen();
    fullscreen(!fs);
    toggleControls();
  }
}

// * Mobile Events
// ************************************************************************************

// Disable scrolling on mobile.
function touchMoved() {
  return false;
}

function touchEnded() {
  if (touchY > 50 && mouseY < windowHeight - 100) {
    toggleControls();
  }
}
