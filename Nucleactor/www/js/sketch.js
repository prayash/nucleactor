var num = 200, frames = 480, edge = 40;
var fragments = [];
var theta = 0;
var gradientVariance = 5
var colorCounter = 0;
var rad;
var r = 100;
var song;
var amplitude;
var volume;

function preload() {
  song = loadSound('toe.mp3');
}

function setup() {
  createCanvas(displayWidth, displayHeight);

  // minim   = new Minim(this);
  song.play();
  amplitude = new p5.Amplitude();
  


  // Fragments
  for (var i = 0; i < num; i++) {
    var x = random(displayWidth);
    var y = (displayHeight - 2) / (num) * i;
    fragments.push(new Fragment(x, y));
    fragments[i].px = random(displayWidth);
    fragments[i].py = random(displayHeight);
  }
}

function draw() {
  
  volume = map((amplitude.getLevel() * 300), 0, 255, 0, 255);
  console.log(volume);
  
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
    fill(12.5 * cos((colorCounter * 0.025 ) / 100.0) + 62.5, 1, 1);
    vertex(width, height);
    
    // Reds + Purples
    fill(12.5 * sin((colorCounter + gradientVariance * 0.25 ) / 200.0) + 87.5, 1, 1);
    vertex(-width, height);

  endShape();
  colorCounter += gradientVariance;

// ---------------
  // Nucleactor
  push();
    // ---------------
    // Nucleus
    colorMode(RGB); // Reset colorMode
    translate(displayWidth/2, displayHeight/2);
    noFill();
    fill(-1, 150);

    // if (beat.isOnset()) {
    //   rad = rad * 0.85;
      fill(0, 149, 168, 200);
    // } else {
      rad = 150;
    // }

    for (var i = 0; i < 1024 - 1; i += 5) {
      ellipse(0, 0, 3 * rad / i, 3 * rad / i);
    }

    // ---------------
    // Lines
    // stroke(-1, trebleWeight / 2); // stroke alpha mapped to treble volume
    // for (int i = 0; i < bsize - 1; i += 5) {
    //   float x = (r) * cos(i * 2 * PI/bsize);
    //   float y = (r) * sin(i * 2 * PI/bsize);
    //   float x2 = (r + in.left.get(i) * 20) * cos(i * 2 * PI/bsize);
    //   float y2 = (r + in.left.get(i) * 20) * sin(i * 2 * PI/bsize);
    //   strokeWeight(trebleWeight * 0.0125);
    //   line(x, y, x2, y2);
    // }

    // ---------------
    // Points
    beginShape();
      noFill();
      stroke(255, 180);
      for (var i = 0; i < 1025; i += 26) {
        var x2 = (r ) * cos(i * 2 * PI/1024);
        var y2 = (r ) * sin(i * 2 * PI/1024);
        // vertex(x2, y2);
        push();
          stroke(255, 180);
          strokeWeight(7.5);
          point(x2, y2);
        pop();
      }
    endShape();
  pop();
  // --- End Nucleus -- //

  // Fragments
  colorMode(RGB); // Reset colorMode
  noFill();
  stroke(255, volume);
  strokeWeight(2);
  for (var i = 0; i < fragments.length; i++) {
    fragments[i].run();
  }
  theta += TWO_PI/frames * 0.25;
  
}

// function touchMoved() {
//   // line(touchX, touchY, ptouchX, ptouchY);
// }

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

      if (distance > 0 && distance < 50) {
        line(px, py, fragments[i].px, fragments[i].py);
        // ellipse(px, py, 5, 5);
        // ellipse(fragments[i].px, fragments[i].py, 10, 10);
      }
    }
  }
}