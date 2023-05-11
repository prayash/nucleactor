// Nucleactor by Prayash Thapa (http://prayash.io)
// *********************************************************

let CLIENT_ID = '188bdc288184c969c82a24af4145c999'
let TRACK_URL = 'https://soundcloud.com/effulgence/distance-3'
let BUFFER_SIZE = 1024

// Visual parameters
let num = 90
let frames = 480
let theta = 0
let dispScalar = 10
let colorCounter = 0
let rad = 150
let r = 200
let controlsVisible = true
let fragments = []
let arcs = []

// Audio
let streamUrl = ''
let audio = null
let waveform = null
let volume = 0
let lows = 0
let mids = 0
let highs = 0

// GUI
let hud = ''
let button = ''
let urlInput = ''
let text = ''
let trackInfo = ''
let loadingBar = new Mprogress({
  template: 3,
  parent: '#canvas',
  speed: 0.25,
  easing: 0.25,
})

// **************************************************
// * Preload Audio

function preload() {
  showLoading()
  SC.initialize({ client_id: CLIENT_ID })
  SC.resolve(TRACK_URL)
    .then(afterLoad)
    .catch(function (error) {
      console.log(error)
      console.log('SoundCloud API call failed. Falling back to local media.')
      audio = loadSound('distance.mp3', function () {
        doneLoading()
      })
    })
}

function afterLoad(track) {
  streamUrl = track.stream_url + '?client_id=' + CLIENT_ID
  audio = loadSound(streamUrl, function (loadedTrack) {
    audio.play()
    doneLoading()
    displayInfo(track)
  })
}

function loadTrack() {
  audio.stop()
  showLoading()

  if (trackInfo) {
    trackInfo.remove()
  }

  let trackUrl = urlInput.value
  SC.resolve(trackUrl)
    .then(afterLoad)
    .catch(function (error) {
      console.log(error)
      if (error.status === 403)
        alert(
          'Error: ' +
            "The owner of this track doesn't allow 3rd party streaming. Try another track!"
        )
    })
}

// **************************************************
// * Setup

function setup() {
  frameRate(24)
  let myCanvas = createCanvas(displayWidth, displayHeight)
  myCanvas.parent('canvas')
  createControls()

  // * User Agent Detection
  if (navigator.userAgent.match(/iPhone|iPad|iPod|Android/gi)) {
    console.log('Mobile version.')
    pixelDensity(1)
    num = 45
    dispScalar = 4
  }

  fft = new p5.FFT()
  amplitude = new p5.Amplitude()

  // Fragments
  for (let i = 0; i < num; i++) {
    let x = random(width)
    let y = ((height - 2) / num) * i
    fragments.push(new Fragment(x, y))
    fragments[i].px = random(width)
    fragments[i].py = random(height)
  }

  generateArcs()
}

// **************************************************
// * Draw

function draw() {
  // Analyse audio
  waveform = fft.waveform()

  volume = map(amplitude.getLevel() * 255, 0, 255, 0, 10)
  lows = map(fft.getEnergy('bass'), 0, 255, 0, 10)
  mids = map(fft.getEnergy('mid'), 0, 255, 0, 10)
  highs = map(fft.getEnergy('treble'), 0, 255, 0, 10)
  // console.log("Lows: %i " + "Mids: %i " + "Highs: %i ", lows, mids, highs);

  // * Derived Parameters
  let gradientletiance = map(volume, 0, 25, 0, 50)

  // ***********************************************
  // * Background
  fill(0)
  colorMode(HSB, 100, 1, 1)
  noStroke()
  beginShape()
  // Yellows and Reds
  fill(
    12.5 * sin((colorCounter + highs * 5 + gradientletiance * 0.25) / 100.0) +
      12.5,
    1,
    1
  )
  vertex(-width, -height)

  // Yellows and Whites
  fill(
    12.5 * cos((colorCounter - gradientletiance * 0.25) / 200.0) + 37.5,
    1,
    1
  )
  vertex(width, -height)

  // Blues and Greens
  fill(12.5 * cos((colorCounter * (lows * 5) + 0.025) / 100.0) + 62.5, 1, 1)
  vertex(width, height)

  // Reds + Purples
  fill(
    12.5 * sin((colorCounter + mids * 5 + gradientletiance * 0.25) / 200.0) +
      87.5,
    1,
    1
  )
  vertex(-width, height)

  endShape()
  colorCounter += gradientletiance
  // ***********************************************

  // * Fragments
  stroke(255, volume / 2)
  strokeWeight(volume / 1.5)
  for (let i = 0; i < fragments.length; i++) fragments[i].run()
  theta += (TWO_PI / frames) * 0.35 * (volume / 2)

  // - Nucleactor
  push()
  colorMode(RGB)
  translate(windowWidth / 2, windowHeight / 2)

  // * Epicenter
  noFill()
  noStroke()
  fill(255, 150)
  for (let i = 0; i < waveform.length - 1; i += 5)
    ellipse(0, 0, (5 * rad) / i + volume * 25, (5 * rad) / i + volume * 25)

  // * Waveform
  stroke(255, volume * 20 + lows * 5)
  for (let i = 0; i < waveform.length - 1; i += 2) {
    let x = r * sin((i * 2 * PI) / waveform.length)
    let y = r * cos((i * 2 * PI) / waveform.length)
    let x2 = (r + waveform[i] * 80) * sin((i * 2 * PI) / waveform.length)
    let y2 = (r + waveform[i] * 80) * cos((i * 2 * PI) / waveform.length)
    strokeWeight(2)
    strokeCap(SQUARE)
    line(x, y, x2, y2)
  }

  // * Points
  beginShape()
  noFill()
  for (let i = 0; i < waveform.length; i += 32) {
    let x2 = (r + waveform[i] * 50) * cos((i * 2 * PI) / waveform.length)
    let y2 = (r + waveform[i] * -50) * sin((i * 2 * PI) / waveform.length)
    push()
    stroke(255, 100)
    strokeWeight(5)
    if (i < waveform.length) point(x2, y2)
    pop()
  }
  endShape()

  // * Concentrism
  stroke(255, volume * 35)
  for (let i = 0; i < arcs.length; i++) arcs[i].draw()
  if (volume < 0.5 && random(1) > 0.8) generateArcs()

  pop()
}

// **************************************************

// * Fragment
function Fragment(_x, _y) {
  let x, y
  let px, py, offSet, radius
  let dir
  let col
  let currentOrb
  let randRadius = random(2, 10)

  this.x = _x
  this.y = _y
  offSet = random(TWO_PI)
  radius = random(5, 10)
  dir = random(1) > 0.5 ? 1 : -1

  this.run = function () {
    this.update()
    this.display()
  }

  this.update = function () {
    let leti = map(sin(theta + offSet), -1, 1, -2, -2)
    px = map(sin(theta + offSet), -1, 1, 0, width)
    py = this.y + sin(theta * dir) * radius * leti
  }

  this.display = function () {
    for (let i = 0; i < fragments.length; i++) {
      let distance = dist(px, py, fragments[i].px, fragments[i].py)
      if (distance > 25 && distance < displayWidth / dispScalar) {
        line(px, py, fragments[i].px, fragments[i].py)
        if (random(1) > 0.8 && volume < 2) {
          fill(255, volume / 1.5)
          ellipse(px, py, randRadius, randRadius)
        }
      }
    }
  }
}

// **************************************************

// * Arc
function Arc(_range) {
  let numTraits, lengthTrait, range, strokeWeight, depart, spaceTrait, c
  let traits = []
  let pos = []
  let posTarget = []

  this.range = _range
  numTraits = random(10, 50)
  spaceTrait = random(2, 5)
  depart = random(360)
  lengthTrait = random(1, 50)
  strokeWeight = random(1, 10)
  c = 255

  traits = [numTraits]
  pos = [numTraits]
  posTarget = [numTraits]

  for (let i = 0; i < numTraits; i++) {
    traits[i] = new Trait(i, strokeWeight, lengthTrait, c)
    pos[i] = 0
    posTarget[i] = depart + i * spaceTrait
  }

  this.draw = function () {
    for (let i = 0; i < numTraits; i++) {
      push()
      rotate(radians(pos[i]) + frameCount * 0.025)
      translate(300 - (this.range * 30) / volume, 0)
      traits[i].draw()
      pop()

      pos[i] = posTarget[i]
      if ((i + 1) * spaceTrait > 335) i = numTraits
    }
  }
}

// * Arc Traits
function Trait(_id, _strokeWeight, _lengthTrait, _c) {
  let strokeWeightTarget, lengthTraitTarget, transpTarget
  let lengthTrait = 0,
    transp
  let c

  this.id = _id
  this.strokeWeightTarget = _strokeWeight
  this.c = _c
  this.lengthTraitTarget = _lengthTrait
  transpTarget = 55

  this.draw = function () {
    strokeWeight(this.strokeWeightTarget)
    stroke(this.c, this.volume * 30)
    if (random(1) > 0.98) line(0, 0, 30, 0)
    line(0, 0, lengthTrait, 0)
    lengthTrait = ease(lengthTrait, this.lengthTraitTarget, 0.1)
    transp = ease(transp, transpTarget, 0.7)
  }
}

// * Arc Helpers
let generateArcs = function () {
  arcs = []

  let numArcs
  for (let k = 0; k < 2; k++) {
    numArcs = Math.floor(random(3, 9))
    for (let j = 0; j < numArcs; j++) {
      arcs.push(new Arc(j))
    }
  }
}

let ease = function (letiable, target, easingVal) {
  let d = target - letiable
  if (abs(d) > 1) letiable += d * easingVal
  return letiable
}

// * Utilitarian Helpers
// **************************************************

function windowResized() {
  resizeCanvas(displayWidth, displayHeight)
}

function displayInfo(track) {
  trackInfo = createP(
    'Now playing... <br>' +
      '<strong>' +
      track.title +
      ' by ' +
      track.user.username +
      '</strong>'
  )
  trackInfo.parent('hud')
  trackInfo.addClass('nowPlaying')
  trackInfo.style('font-size', '2em')
  trackInfo.style('padding-bottom', '0.75em')
}

function showLoading() {
  let element = document.getElementById('loading')
  let style = element.style
  style.opacity = '1'
  loadingBar.start()
}

function doneLoading() {
  let element = document.getElementById('loading')
  let style = element.style
  style.opacity = '0'
  loadingBar.end()
}

function createControls() {
  controlsVisible = true
  hud = document.getElementById('hud')
  urlInput = document.getElementById('trackInput')
  urlInput.value =
    'https://soundcloud.com/upscale-recordings/raine-clockvice-wonderful'
  button = document.getElementById('goButton')

  text = createP(
    '<strong>Nucleactor</strong> is an audio visualizer created by Prayash Thapa (<strong><a href="http://prayash.io" target="_blank">prayash.io</a></strong>).<br>Chrome / Firefox recommended! CLICK to play!'
  )
  text.parent('hud')
  text.addClass('nowPlaying')
  text.style('bottom', '20px !important')
  text.style('font-size', '1em')
}

function toggleControls() {
  if (controlsVisible) {
    controlsVisible = false
    hud.className = ' '
    hud.className += ' hide'
  } else {
    controlsVisible = true
    hud.className = ' '
    hud.className += ' show'
  }
}

// * Events
// **************************************************

function mousePressed() {
  if (mouseY > 50 && mouseY < windowHeight - 100) {
    if (!audio._playing) {
      displayInfo({ title: 'Distance', user: { username: 'Effulgence' } })
      audio.play()
    }
  }
}

// * Mobile Events
// **************************************************

// Disable scrolling on mobile.
function touchMoved() {
  return false
}
