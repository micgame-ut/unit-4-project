// Story 3: the moon. Loaded after clock-story.js and shares app.js globals
// (scene, stage, isRunning, activeStory, motionPreference), door-story.js's
// idleSeconds, doorTarget and storyHint, and clock-story.js's ensureAudio().
//
// Tap the moon -> a sleigh silhouette flies across it. Around the flight: the
// moon flares, the scene dims at the edges, gold glitter sheds behind the sleigh,
// and glints ripple across the sky. One timeline of Web Animations drives it, so
// Play/Pause stops everything (and the audio clock) together.

const moonTarget = document.querySelector("#moon-target");
const sleighImage = document.querySelector(".sleigh");
const moonLayer = stage.querySelector(".layer--moon");
const hillLayer = stage.querySelector(".layer--spiral-hill-body-trees-fence");

const MOON_TOTAL_MS = 6000;
const MOON_IDLE_HINT_AFTER = 40; // idle seconds before the moon pulses

// Flight: the sleigh enters off the left edge and leaves off the right (art px).
const FLIGHT_START_MS = 800;
const FLIGHT_MS = 4000;
const FLIGHT_FROM_X = -380;
const FLIGHT_TO_X = 960;
const SLEIGH_WIDTH = 364;
const SLEIGH_HEIGHT = 80;
const PATH_SAMPLES = 24;

const FLARE_START_MS = 1500; // the moon brightens while the sleigh crosses it
const FLARE_MS = 2700;
const TRAIL_PARTICLES = 70;
const GLINT_COUNT = 28;

// Jingle bells and wind, scheduled on the Web Audio clock from t = 0.
const BELL_PINGS = 20;
const WHOOSH_MS = 4000;

let moonAnimations = [];

// Where the sleigh is as a fraction u (0..1) of its flight: a gentle rising arc.
const sleighX = (u) => FLIGHT_FROM_X + (FLIGHT_TO_X - FLIGHT_FROM_X) * u;
const sleighY = (u) => 150 - 90 * u - 25 * Math.sin(u * Math.PI);

function trackMoon(element, keyframes, options) {
  const animation = element.animate(keyframes, options);
  moonAnimations.push(animation);
  return animation;
}

// ---- Flight -----------------------------------------------------------------

function flightKeyframes() {
  const frames = [];
  for (let i = 0; i <= PATH_SAMPLES; i += 1) {
    const u = i / PATH_SAMPLES;
    const ahead = Math.min(1, u + 0.01);
    const behind = Math.max(0, u - 0.01);
    // Tilt the nose along the path: up while climbing.
    const tilt = (Math.atan2(sleighY(ahead) - sleighY(behind), sleighX(ahead) - sleighX(behind)) * 180) / Math.PI;
    frames.push({
      transform: `translate(${sleighX(u)}px, ${sleighY(u)}px) rotate(${tilt}deg)`,
      opacity: 1,
      offset: u,
    });
  }
  return frames;
}

// ---- Effects ----------------------------------------------------------------

function addNightVeil() {
  const veil = document.createElement("div");
  veil.className = "night-veil";
  stage.append(veil);
  trackMoon(veil, [
    { opacity: 0, offset: 0 },
    { opacity: 1, offset: 900 / MOON_TOTAL_MS },
    { opacity: 1, offset: 5100 / MOON_TOTAL_MS },
    { opacity: 0, offset: 1 },
  ], { duration: MOON_TOTAL_MS });
  return [veil];
}

// Moon flare: the moon layer brightens, and (with motion) its halo swells.
function addMoonFlare(reduceMotion) {
  trackMoon(moonLayer, [
    { filter: "brightness(1)" },
    { filter: "brightness(1.35)", offset: 0.5 },
    { filter: "brightness(1)" },
  ], { duration: FLARE_MS, delay: FLARE_START_MS, easing: "ease-in-out" });

  const halo = stage.querySelector(".glow--moon");
  if (halo && !reduceMotion) {
    trackMoon(halo, [
      { transform: "scale(1)", opacity: 0.85 },
      { transform: "scale(1.45)", opacity: 1, offset: 0.5 },
      { transform: "scale(1)", opacity: 0.85 },
    ], { duration: FLARE_MS, delay: FLARE_START_MS, easing: "ease-in-out", fill: "backwards" });
  }
}

// Gold glitter: each speck is dropped from where the sleigh is at its moment.
function addSparkleTrail() {
  const specks = [];
  for (let i = 0; i < TRAIL_PARTICLES; i += 1) {
    const u = (i / TRAIL_PARTICLES) * 0.85; // stop shedding before the sleigh leaves
    const speck = document.createElement("div");
    const size = 5 + Math.random() * 8;
    speck.className = "sparkle-dust";
    speck.style.width = `${size}px`;
    speck.style.height = `${size}px`;
    speck.style.left = `${sleighX(u) + 30 + Math.random() * 40}px`;
    speck.style.top = `${sleighY(u) + 50 + Math.random() * 25}px`;
    stage.insertBefore(speck, hillLayer);
    specks.push(speck);

    trackMoon(speck, [
      { transform: "translate(0, 0) scale(0.6)", opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { transform: `translate(${(Math.random() - 0.5) * 70}px, ${110 + Math.random() * 150}px) scale(1)`, opacity: 0 },
    ], {
      delay: FLIGHT_START_MS + u * FLIGHT_MS,
      duration: 1100 + Math.random() * 600,
      easing: "ease-out",
    });
  }
  return specks;
}

// Star twinkle wave: glints flash in the sky just as the sleigh passes over each.
function addStarTwinkle() {
  const glints = [];
  for (let i = 0; i < GLINT_COUNT; i += 1) {
    const x = 30 + Math.random() * 880;
    const glint = document.createElement("div");
    glint.className = "sparkle";
    glint.style.left = `${x - 17}px`;
    glint.style.top = `${15 + Math.random() * 230}px`;
    stage.insertBefore(glint, hillLayer);
    glints.push(glint);

    const u = Math.min(1, Math.max(0, (x - FLIGHT_FROM_X) / (FLIGHT_TO_X - FLIGHT_FROM_X)));
    trackMoon(glint, [
      { transform: "scale(0) rotate(0deg)", opacity: 0 },
      { transform: "scale(1.1) rotate(45deg)", opacity: 1, offset: 0.35 },
      { transform: "scale(0) rotate(90deg)", opacity: 0 },
    ], { delay: FLIGHT_START_MS + u * FLIGHT_MS, duration: 900 + Math.random() * 500, easing: "ease-in-out" });
  }
  return glints;
}

// ---- Sound ------------------------------------------------------------------

// A quiet rush of wind under the flight, and jingle bells along it, all on the
// Web Audio clock so Pause (which suspends the context) holds them in step.
function playSleighSound() {
  const context = ensureAudio();
  const origin = context.currentTime + 0.05;

  const noise = context.createBufferSource();
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i += 1) samples[i] = Math.random() * 2 - 1;
  noise.buffer = buffer;
  noise.loop = true;
  const wind = context.createBiquadFilter();
  wind.type = "bandpass";
  wind.Q.value = 0.8;
  const windGain = context.createGain();
  const start = origin + FLIGHT_START_MS / 1000;
  const end = start + WHOOSH_MS / 1000;
  wind.frequency.setValueAtTime(300, start);
  wind.frequency.exponentialRampToValueAtTime(1100, start + WHOOSH_MS / 2000);
  wind.frequency.exponentialRampToValueAtTime(400, end);
  windGain.gain.setValueAtTime(0.0001, start);
  windGain.gain.exponentialRampToValueAtTime(0.06, start + 1.2);
  windGain.gain.exponentialRampToValueAtTime(0.0001, end);
  noise.connect(wind).connect(windGain).connect(context.destination);
  noise.start(start);
  noise.stop(end + 0.1);

  for (let i = 0; i < BELL_PINGS; i += 1) {
    const when = origin + (FLARE_START_MS + (i / BELL_PINGS) * (FLIGHT_MS - 900)) / 1000 + Math.random() * 0.08;
    const pitch = 2093 * (1 + Math.random() * 0.5);
    [pitch, pitch * 1.5].forEach((frequency, partial) => {
      const tone = context.createOscillator();
      const gain = context.createGain();
      tone.type = "sine";
      tone.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(partial ? 0.02 : 0.045, when + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.4);
      tone.connect(gain).connect(context.destination);
      tone.start(when);
      tone.stop(when + 0.45);
    });
  }
}

// ---- The story --------------------------------------------------------------

async function playMoonStory(openedByKeyboard) {
  activeStory = "moon";
  storyHint.textContent = "A shadow crosses the moon.";
  setStoryTargetsInert(true);

  const reduceMotion = motionPreference.matches;
  const temporary = [];

  // Keep the sleigh just behind the hill, in front of the moon and its halo.
  stage.insertBefore(sleighImage, hillLayer);

  temporary.push(...addNightVeil());
  addMoonFlare(reduceMotion);

  if (reduceMotion) {
    // No flight: the silhouette rests over the moon, fading in and out.
    sleighImage.style.transform = `translate(${277 - SLEIGH_WIDTH / 2}px, ${150}px)`;
    trackMoon(sleighImage, [
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.25 },
      { opacity: 1, offset: 0.7 },
      { opacity: 0, offset: 1 },
    ], { duration: MOON_TOTAL_MS });
  } else {
    trackMoon(sleighImage, flightKeyframes(), { delay: FLIGHT_START_MS, duration: FLIGHT_MS, easing: "linear", fill: "backwards" });
    temporary.push(...addSparkleTrail(), ...addStarTwinkle());
  }

  try {
    playSleighSound();
  } catch (error) {
    // Sound is a bonus; the visuals carry the story on their own.
  }

  // The longest-running animation sets the pace; the veil spans the whole story.
  if (!isRunning) moonAnimations.forEach((animation) => animation.pause());
  await Promise.all(moonAnimations.map((animation) => animation.finished));

  moonAnimations.forEach((animation) => animation.cancel());
  moonAnimations = [];
  temporary.forEach((element) => element.remove());
  sleighImage.style.removeProperty("transform");

  setStoryTargetsInert(false);
  activeStory = null;
  storyHint.textContent = "The sleigh is gone. Tap the moon to see it again.";
  // Keyboard users get focus back on the moon; for touch and mouse a focus ring would be noise.
  if (openedByKeyboard) moonTarget.focus();
}

// While the moon plays, the door and clock can't take focus or taps.
function setStoryTargetsInert(inert) {
  doorTarget.inert = inert;
  document.querySelector("#clock-target").inert = inert;
}

moonTarget.addEventListener("click", (event) => {
  if (!isRunning || activeStory) return;
  // A click with no pointer position (detail 0) came from the keyboard.
  void playMoonStory(event.detail === 0);
});

// The moon pulses when everything has been quiet for a while.
setInterval(() => {
  moonTarget.classList.toggle("moon-target--hinting", !activeStory && idleSeconds >= MOON_IDLE_HINT_AFTER);
}, 1000);

scene.addEventListener("runningchange", (event) => {
  const { running } = event.detail;
  moonAnimations.forEach((animation) => (running ? animation.play() : animation.pause()));
});
