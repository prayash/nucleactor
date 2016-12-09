# Nucleactor 
***
Nucleactor is a procedural audio-visualizer that streams audio data using the SoundCloud API. It uses no pre-rendered assets and draws all graphics on the fly using the HTML5 Canvas and p5.js library. An FFT algorithm is used to parse the audio data and generate the waveform at the center, and those values are also used to control the thickness and visibility of the fragmented lines that connect to arbitrary nodes floating across the screen.

I built it during a 24 hour hackathon (T9 Hacks) at the University of Colorado Boulder. My main motive in developing this project was to create a unique aesthetic which isn't too busy on the eyes but still relatively dynamic and engaging. I'm constantly in the process of optimizing it as much of the audio data isn't being fully leveraged.

![Render](https://mir-s3-cdn-cf.behance.net/project_modules/1400/02cd5543172121.57e5985a51b69.png)
