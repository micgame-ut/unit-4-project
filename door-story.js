// Story 1: the Christmas-tree door. Loaded after app.js and shares its globals
// (scene, stage, isRunning, motionPreference, hotspotsPromise).
//
// R3a (this file so far): four taps light the ornament rows lowest to highest,
// each with a rising chime; the fourth lights the star. Idle hints grow more
// specific. The door opening, snow gust and full reset arrive in R3b.

const doorTarget = document.querySelector("#door-target");
const storyHint = document.querySelector("#story-hint");

const ROW_NAMES = ["row1", "row2", "row3", "row4"]; // hotspots.json, lowest to highest
const ROW_COLORS = ["#ff4a3d", "#ffa63d", "#4fe0c0", "#ff7ad9"];
const CHIME_NOTES = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6, one per row
const STAR_NOTE = 1318.51; // E6

// Hints wait for idle time spent running, so Pause holds them like the chime clock.
const HINTS = [
  { after: 8, pulse: true, text: "" },
  { after: 18, pulse: true, text: "Something about that door is waiting to be tapped." },
  { after: 30, pulse: true, text: "Tap the door four times: the lowest lights come first." },
];

let rowGroups = [];      // rowGroups[i] = glow elements for row i
let starGlow = null;
let litRows = 0;         // 0-4, how many rows are lit
let idleSeconds = 0;
let audioContext = null;
let storyLocked = false; // true while a finished sequence plays out

function makeGlow(spot, className, scale) {
  const glow = document.createElement("div");
  const size = spot.radius * 2 * scale;
  glow.className = `glow ${className}`;
  glow.style.left = `${spot.x - size / 2}px`;
  glow.style.top = `${spot.y - size / 2}px`;
  glow.style.width = `${size}px`;
  glow.style.height = `${size}px`;
  // Sits above the door panel (layer 15) and below the front steps (layer 16).
  stage.insertBefore(glow, stage.querySelector(".layer--front-steps-two-lanterns"));
  return glow;
}

async function buildOrnamentGlows() {
  try {
    const hotspots = await hotspotsPromise;
    rowGroups = ROW_NAMES.map((rowName, rowIndex) =>
      hotspots.ornaments[rowName].map((spot) => {
        const glow = makeGlow(spot, "glow--ornament", 4);
        glow.style.setProperty("--ornament-color", ROW_COLORS[rowIndex]);
        return glow;
      })
    );
    starGlow = makeGlow(hotspots.star, "glow--star", 3.4);
  } catch (error) {
    // Without coordinates the door has nothing to light, so leave it inert.
    doorTarget.hidden = true;
    console.warn("Door story unavailable:", error);
  }
}

// Chimes are synthesized in the browser, so the story bundles no audio files.
function playChime(frequency) {
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended" && isRunning) void audioContext.resume();

    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    const tone = audioContext.createOscillator();
    tone.type = "sine";
    tone.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    tone.connect(gain).connect(audioContext.destination);
    tone.start(now);
    tone.stop(now + 1.5);
  } catch (error) {
    // Sound is a bonus here; the lights still show progress.
  }
}

function showHint(hint) {
  doorTarget.classList.toggle("door-target--hinting", Boolean(hint?.pulse));
  storyHint.textContent = hint?.text ?? "";
}

function resetIdle() {
  idleSeconds = 0;
  showHint(null);
}

function lightRow(rowIndex) {
  rowGroups[rowIndex].forEach((glow) => glow.classList.add("glow--lit"));
  playChime(CHIME_NOTES[rowIndex]);
}

function resetLights() {
  rowGroups.flat().forEach((glow) => glow.classList.remove("glow--lit"));
  starGlow?.classList.remove("glow--lit");
  litRows = 0;
}

// ---- The reveal (R3b) -----------------------------------------------------
// One timeline: every moving part is a Web Animation spanning REVEAL_MS with
// keyframe offsets taken from the beat times below, so they stay in step and
// Play/Pause can pause or resume them all together.
const REVEAL_MS = 7400;
const BEATS = {
  openStart: 800,   // door begins to swing
  openEnd: 2600,    // fully open, snowy interior holds
  gustStart: 4000,  // flakes burst out of the doorway
  washUp: 4200,     // white-out begins
  washFull: 5600,
  washHold: 6200,   // scene is hidden: door shuts and lights go out beneath the snow
  washDown: 7200,   // snow clears
};
const DOOR_OPEN_DEGREES = -78; // negative: the free edge swings toward the viewer
const DOOR_PIVOT = { x: 400, y: 1085 }; // hotspots.json door.pivot (left hinge)
const GUST_ORIGIN = { x: 505, y: 1085 };
const FLAKE_COUNT = 70;

let revealAnimations = [];

const at = (ms) => ms / REVEAL_MS;

function track(element, keyframes, options) {
  const animation = element.animate(keyframes, { fill: "both", ...options });
  revealAnimations.push(animation);
  return animation;
}

function doorSwing(degrees) {
  return `perspective(700px) rotateY(${degrees}deg)`;
}

function openingKeyframes(reduceMotion) {
  const swing = (degrees, offset, easing) => ({
    transform: doorSwing(degrees),
    offset: at(offset),
    easing,
  });

  if (reduceMotion) {
    // No swing: the door simply fades away and back while the beats stay put.
    return [
      { opacity: 1, offset: at(BEATS.openStart) },
      { opacity: 0, offset: at(BEATS.openEnd) },
      { opacity: 0, offset: at(BEATS.washHold) },
      { opacity: 1, offset: at(BEATS.washDown) },
    ];
  }

  return [
    { ...swing(0, 0), offset: 0 },
    swing(0, BEATS.openStart, "cubic-bezier(0.3, 0, 0.2, 1)"),
    swing(DOOR_OPEN_DEGREES, BEATS.openEnd),
    swing(DOOR_OPEN_DEGREES, BEATS.washHold, "ease-in"),
    swing(0, BEATS.washDown),
    { ...swing(0, REVEAL_MS), offset: 1 },
  ];
}

// Glows on the door panel ride the door, then switch off while the snow hides it.
function glowKeyframes(reduceMotion) {
  if (reduceMotion) {
    return [
      { opacity: 1, offset: at(BEATS.openStart) },
      { opacity: 0, offset: at(BEATS.openEnd) },
      { opacity: 0, offset: 1 },
    ];
  }

  return [
    { transform: doorSwing(0), opacity: 1, offset: at(BEATS.openStart), easing: "cubic-bezier(0.3, 0, 0.2, 1)" },
    { transform: doorSwing(DOOR_OPEN_DEGREES), opacity: 1, offset: at(BEATS.openEnd) },
    { transform: doorSwing(DOOR_OPEN_DEGREES), opacity: 1, offset: at(BEATS.washFull) },
    { transform: doorSwing(DOOR_OPEN_DEGREES), opacity: 0, offset: at(BEATS.washHold), easing: "ease-in" },
    { transform: doorSwing(0), opacity: 0, offset: at(BEATS.washDown) },
    { transform: doorSwing(0), opacity: 0, offset: 1 },
  ];
}

function buildSnow(reduceMotion) {
  const wash = document.createElement("div");
  wash.className = "snow-wash";
  stage.append(wash);
  track(wash, [
    { opacity: 0, offset: at(BEATS.washUp) },
    { opacity: 0.94, offset: at(BEATS.washFull) },
    { opacity: 0.94, offset: at(BEATS.washHold) },
    { opacity: 0, offset: at(BEATS.washDown) },
  ], { duration: REVEAL_MS });

  const flakes = [wash];
  if (reduceMotion) return flakes; // the white-out fade alone carries the beat

  for (let i = 0; i < FLAKE_COUNT; i += 1) {
    const flake = document.createElement("div");
    const size = 5 + Math.random() * 9;
    flake.className = "snow-flake";
    flake.style.width = `${size}px`;
    flake.style.height = `${size}px`;
    flake.style.left = `${GUST_ORIGIN.x}px`;
    flake.style.top = `${GUST_ORIGIN.y}px`;
    stage.append(flake);
    flakes.push(flake);

    const dx = (Math.random() - 0.5) * 1500;
    const dy = -Math.random() * 1400 + 250;
    track(flake, [
      { transform: "translate(0, 0) scale(0.3)", opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 0.9 },
    ], {
      delay: BEATS.gustStart + Math.random() * 700,
      duration: 1500 + Math.random() * 900,
      easing: "ease-out",
    });
  }
  return flakes;
}

async function playReveal() {
  storyLocked = true;
  storyHint.textContent = "The door swings open on a snowy Christmas world.";

  const reduceMotion = motionPreference.matches;
  const doorPanel = stage.querySelector(".layer--green-christmas-door-panel");
  const doorLights = [...rowGroups.flat(), starGlow];
  const extras = buildSnow(reduceMotion);

  // Each part pivots about the door's hinge edge, expressed in its own box.
  const pivotedParts = [doorPanel, ...doorLights];
  pivotedParts.forEach((part) => {
    part.style.transformOrigin = `${DOOR_PIVOT.x - part.offsetLeft}px ${DOOR_PIVOT.y - part.offsetTop}px`;
  });
  track(doorPanel, openingKeyframes(reduceMotion), { duration: REVEAL_MS });
  doorLights.forEach((glow) => track(glow, glowKeyframes(reduceMotion), { duration: REVEAL_MS }));

  // Respect a Pause that happened between the tap and here.
  if (!isRunning) revealAnimations.forEach((animation) => animation.pause());

  await Promise.all(revealAnimations.map((animation) => animation.finished));

  // Tear down: the scene is back to its closed, unlit start.
  revealAnimations.forEach((animation) => animation.cancel());
  revealAnimations = [];
  extras.forEach((element) => element.remove());
  pivotedParts.forEach((part) => part.style.removeProperty("transform-origin"));
  resetLights();
  storyLocked = false;
  resetIdle();
  storyHint.textContent = "The snow clears. Tap the door to play again.";
}

doorTarget.addEventListener("click", () => {
  if (!isRunning || storyLocked || activeStory || !rowGroups.length) return;

  resetIdle();
  lightRow(litRows);
  litRows += 1;
  storyHint.textContent = `${litRows} of 4 rows of lights glowing.`;

  if (litRows === ROW_NAMES.length) {
    starGlow.classList.add("glow--lit");
    playChime(STAR_NOTE);
    void playReveal();
  }
});

setInterval(() => {
  if (!isRunning || storyLocked || activeStory) return;

  idleSeconds += 1;
  const reached = HINTS.filter((hint) => idleSeconds >= hint.after).at(-1);
  if (reached) showHint(reached);
}, 1000);

// Pausing also silences any chime still ringing.
// The reveal's animations pause and resume with it.
scene.addEventListener("runningchange", (event) => {
  const { running } = event.detail;
  revealAnimations.forEach((animation) => (running ? animation.play() : animation.pause()));

  if (!audioContext) return;
  if (running) void audioContext.resume();
  else void audioContext.suspend();
});

void buildOrnamentGlows();
