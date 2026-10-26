// Story 2: the clock tower. Loaded after door-story.js and shares app.js globals
// (scene, stage, isRunning, activeStory, motionPreference).
//
// Tap the tower clock -> its close-up grows out of the clock; drag the minute
// hand around the face (the hour hand follows like the gears of a real clock)
// until it reads midnight, then zoom back out to the town, where the clock
// strikes twelve and the windows swell with light before everything resets.

const clockTarget = document.querySelector("#clock-target");
const closeup = document.querySelector("#clock-closeup");
const clockFace = document.querySelector("#clock-face");
const hourHand = document.querySelector("#hour-hand");
const minuteHand = document.querySelector("#minute-hand");
const clockBack = document.querySelector("#clock-back");

// Art coordinates (941x1672): the clock on the tower, and the close-up's face center.
const TOWER_CLOCK = { x: 556, y: 449 }; // hotspots.json clockFace
const FACE_CENTER = { x: 480, y: 866 };
const ZOOM_MS = 1200;
const MIDNIGHT_TOLERANCE_MIN = 2.5; // how close to 12:00 counts, in clock minutes
const MINUTES_PER_HALF_DAY = 720;

// Hints wait for idle time spent running in the close-up, like story 1.
const CLOCK_HINTS = [
  { after: 6, pulse: true, text: "Turn the minute hand clockwise." },
  { after: 16, pulse: true, text: "Keep winding until both hands point straight up." },
];

let clockMinutes = 0;        // unwrapped minutes on the clock; 720 = a full lap of the hour hand
// Which part of the story is running. Input only counts in "playing"; every
// other phase ignores drags and taps, so a finger still down at midnight can't
// trigger a second solve or a second zoom-out.
let clockPhase = "closed"; // closed -> opening -> playing -> solving -> closing -> closed
let clockIdleSeconds = 0;
let zoomAnimation = null;
let handSnapAnimations = [];
let dragLastAngle = null;
let clockOpenedByKeyboard = false;

const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;

// ---- Hands ------------------------------------------------------------------

function formatClock(minutes) {
  const wrapped = Math.floor(modulo(minutes, MINUTES_PER_HALF_DAY));
  const hour = Math.floor(wrapped / 60) || 12;
  return `${hour}:${String(wrapped % 60).padStart(2, "0")}`;
}

function drawHands() {
  // Minute hand: 6 degrees a minute. Hour hand: 0.5 degrees a minute.
  minuteHand.style.transform = `rotate(${clockMinutes * 6}deg)`;
  hourHand.style.transform = `rotate(${clockMinutes * 0.5}deg)`;
  minuteHand.setAttribute("aria-valuenow", Math.floor(modulo(clockMinutes, MINUTES_PER_HALF_DAY)));
  minuteHand.setAttribute("aria-valuetext", formatClock(clockMinutes));
}

// Start somewhere in the 10:00-11:35 range: at least 25 minutes of winding to go.
function randomStartMinutes() {
  return 600 + Math.floor(Math.random() * 96);
}

// True if moving the clock from one reading to the next landed on or crossed 12:00.
function reachedMidnight(from, to) {
  const lower = Math.min(from, to);
  const upper = Math.max(from, to);
  const nextMidnight = Math.ceil(lower / MINUTES_PER_HALF_DAY) * MINUTES_PER_HALF_DAY;
  if (nextMidnight <= upper) return true; // crossed (or hit) midnight on the way
  const nearest = Math.round(to / MINUTES_PER_HALF_DAY) * MINUTES_PER_HALF_DAY;
  return Math.abs(to - nearest) <= MIDNIGHT_TOLERANCE_MIN;
}

function setClock(nextMinutes) {
  const previous = clockMinutes;
  clockMinutes = nextMinutes;
  drawHands();
  resetClockIdle();
  if (clockPhase === "playing" && reachedMidnight(previous, nextMinutes)) void solveClock();
}

// ---- Dragging ---------------------------------------------------------------

// Pointer angle around the face center, in degrees clockwise from 12 o'clock.
function pointerAngle(event) {
  const rect = closeup.getBoundingClientRect();
  const scale = rect.width / 941;
  const centerX = rect.left + FACE_CENTER.x * scale;
  const centerY = rect.top + FACE_CENTER.y * scale;
  return (Math.atan2(event.clientX - centerX, centerY - event.clientY) * 180) / Math.PI;
}

clockFace.addEventListener("pointerdown", (event) => {
  if (!isRunning || clockPhase !== "playing") return;

  event.preventDefault();
  try {
    clockFace.setPointerCapture(event.pointerId);
  } catch (error) {
    // Capture is a nicety; dragging still works inside the face without it.
  }
  dragLastAngle = pointerAngle(event);
});

clockFace.addEventListener("pointermove", (event) => {
  if (dragLastAngle === null || !isRunning || clockPhase !== "playing") return;

  const angle = pointerAngle(event);
  // Shortest signed turn since the last move, so crossing 12 doesn't jump.
  let turn = angle - dragLastAngle;
  if (turn > 180) turn -= 360;
  if (turn < -180) turn += 360;
  dragLastAngle = angle;

  setClock(clockMinutes + turn / 6);
});

["pointerup", "pointercancel"].forEach((type) =>
  clockFace.addEventListener(type, () => {
    dragLastAngle = null;
  })
);

// Keyboard: arrows turn the minute hand a minute at a time, Page keys five.
minuteHand.addEventListener("keydown", (event) => {
  if (!isRunning || clockPhase !== "playing") return;

  const steps = {
    ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5,
  };
  if (!(event.key in steps)) return;

  event.preventDefault();
  setClock(clockMinutes + steps[event.key]);
});

// ---- Zoom in and out --------------------------------------------------------

// The close-up starts small and sitting on the tower's clock, then grows to fill
// the stage. Origin is the close-up's own face center, so that point lands on the
// tower clock first and eases to where it belongs.
function zoomKeyframes(reduceMotion) {
  if (reduceMotion) return [{ opacity: 0 }, { opacity: 1 }];

  const offset = { x: TOWER_CLOCK.x - FACE_CENTER.x, y: TOWER_CLOCK.y - FACE_CENTER.y };
  return [
    { transform: `translate(${offset.x}px, ${offset.y}px) scale(0.12)`, opacity: 0 },
    { opacity: 1, offset: 0.35 },
    { transform: "translate(0, 0) scale(1)", opacity: 1 },
  ];
}

async function playZoom(direction) {
  const reduceMotion = motionPreference.matches;
  closeup.style.transformOrigin = `${FACE_CENTER.x}px ${FACE_CENTER.y}px`;
  zoomAnimation = closeup.animate(zoomKeyframes(reduceMotion), {
    duration: reduceMotion ? 400 : ZOOM_MS,
    easing: "cubic-bezier(0.3, 0, 0.2, 1)",
    direction,
    fill: "both",
  });
  if (!isRunning) zoomAnimation.pause();

  try {
    await zoomAnimation.finished;
  } finally {
    zoomAnimation.cancel();
    zoomAnimation = null;
  }
}

async function openClock() {
  if (!isRunning || activeStory || clockPhase !== "closed") return;

  activeStory = "clock";
  clockPhase = "opening";
  dragLastAngle = null;
  setClockInert(true);
  clockMinutes = randomStartMinutes();
  drawHands();
  resetClockIdle();
  closeup.hidden = false;
  clockBack.hidden = false;
  try {
    ensureAudio(); // made on this tap so the strikes later are allowed to sound
  } catch (error) {
    // No Web Audio: the story still plays, silently.
  }
  await playZoom("normal");
  clockPhase = "playing";
  if (clockOpenedByKeyboard) minuteHand.focus();
}

// Called from "playing" (Back) or "solving" (after the hands settle on 12). When
// the clock was solved, the midnight scene plays in the town view before control
// returns; the story stays active (and the targets inert) until it ends.
async function closeClock({ thenMidnight = false } = {}) {
  if (clockPhase !== "playing" && clockPhase !== "solving") return;

  clockPhase = "closing";
  dragLastAngle = null;
  clockBack.hidden = true;
  await playZoom("reverse");
  closeup.hidden = true;

  if (thenMidnight) {
    clockPhase = "midnight";
    await playMidnight();
  }

  clockPhase = "closed";
  activeStory = null;
  setClockInert(false);
  storyHint.textContent = thenMidnight ? "The town settles. Tap the clock to wind it again." : "";
  if (clockOpenedByKeyboard) clockTarget.focus(); // a focus ring would be noise for touch and mouse
}

// While the close-up is open, the tower and door targets underneath must not take
// focus or taps.
function setClockInert(inert) {
  clockTarget.inert = inert;
  doorTarget.inert = inert;
  document.querySelector("#moon-target").inert = inert;
}

clockTarget.addEventListener("click", (event) => {
  clockOpenedByKeyboard = event.detail === 0; // detail 0: no pointer position, so the keyboard
  void openClock();
});
clockBack.addEventListener("click", () => {
  if (clockPhase === "playing") void closeClock();
});

// ---- Solving ----------------------------------------------------------------

async function solveClock() {
  clockPhase = "solving";
  dragLastAngle = null; // the drag is over even if the finger is still down
  clockBack.hidden = true;
  showClockHint(null);

  // Settle both hands exactly on 12, then leave the close-up.
  const settled = Math.round(clockMinutes / MINUTES_PER_HALF_DAY) * MINUTES_PER_HALF_DAY;
  const reduceMotion = motionPreference.matches;
  const snapOptions = { duration: reduceMotion ? 1 : 500, easing: "ease-out", fill: "forwards" };
  handSnapAnimations = [
    minuteHand.animate([{ transform: `rotate(${clockMinutes * 6}deg)` }, { transform: `rotate(${settled * 6}deg)` }], snapOptions),
    hourHand.animate([{ transform: `rotate(${clockMinutes * 0.5}deg)` }, { transform: `rotate(${settled * 0.5}deg)` }], snapOptions),
  ];
  if (!isRunning) handSnapAnimations.forEach((animation) => animation.pause());

  await Promise.all(handSnapAnimations.map((animation) => animation.finished));
  clockMinutes = settled;
  drawHands();
  handSnapAnimations.forEach((animation) => animation.cancel());
  handSnapAnimations = [];

  await closeClock({ thenMidnight: true });
}

// ---- Midnight (R4b) ---------------------------------------------------------
// Back in the town view the clock strikes twelve. Every strike is a synthesized
// bell on the Web Audio clock and a pulse of the moon; the town's windows,
// jack-o'-lanterns and lanterns swell with light in a ripple from left to right.
// Pausing suspends the audio clock and pauses every animation here together.

const STRIKE_COUNT = 12;
const STRIKE_GAP_S = 0.33;
const BLOOM_MS = 1400;
const RIPPLE_MS = 2400; // time for the ripple to cross the whole town
const BELL_HZ = 196; // G3
// [frequency ratio, loudness, decay seconds]: an uneven set of partials sounds like metal.
const BELL_PARTIALS = [[1, 0.5, 2.4], [2.0, 0.25, 1.6], [2.76, 0.2, 1.1], [5.4, 0.1, 0.6], [8.93, 0.05, 0.4]];

let midnightAnimations = [];

function ensureAudio() {
  audioContext ??= new AudioContext(); // shared with door-story.js
  if (audioContext.state === "suspended" && isRunning) void audioContext.resume();
  return audioContext;
}

function playBell(when) {
  const context = ensureAudio();
  BELL_PARTIALS.forEach(([ratio, loudness, decay]) => {
    const tone = context.createOscillator();
    const gain = context.createGain();
    tone.type = "sine";
    tone.frequency.value = BELL_HZ * ratio;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(loudness * 0.22, when + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    tone.connect(gain).connect(context.destination);
    tone.start(when);
    tone.stop(when + decay + 0.05);
  });
}

function bloomKeyframes(reduceMotion) {
  // Reduced motion keeps the light swell but drops the growing of the glow.
  const grow = (scale) => (reduceMotion ? {} : { transform: `scale(${scale})` });
  return [
    { opacity: 0.8, ...grow(1) },
    { opacity: 1, ...grow(2.1), offset: 0.25 },
    { opacity: 1, ...grow(1.5), offset: 0.7 },
    { opacity: 0.8, ...grow(1) },
  ];
}

async function playMidnight() {
  const reduceMotion = motionPreference.matches;
  storyHint.textContent = "The clock strikes twelve.";

  try {
    const start = ensureAudio().currentTime + 0.1;
    for (let strike = 0; strike < STRIKE_COUNT; strike += 1) playBell(start + strike * STRIKE_GAP_S);
  } catch (error) {
    // Sound is a bonus; the light show still plays without it.
  }

  stage.querySelectorAll(".glow--window, .glow--pumpkin, .glow--lantern").forEach((glow) => {
    const centerX = glow.offsetLeft + glow.offsetWidth / 2;
    midnightAnimations.push(
      glow.animate(bloomKeyframes(reduceMotion), {
        duration: BLOOM_MS,
        delay: (centerX / ART_WIDTH) * RIPPLE_MS,
        easing: "ease-in-out",
        fill: "backwards",
      })
    );
  });

  const moonGlow = stage.querySelector(".glow--moon");
  if (moonGlow && !reduceMotion) {
    // One swell of the moon per strike.
    midnightAnimations.push(
      moonGlow.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.15)", offset: 0.3 }, { transform: "scale(1)" }],
        { duration: STRIKE_GAP_S * 1000, iterations: STRIKE_COUNT, easing: "ease-out" }
      )
    );
  }

  if (!isRunning) midnightAnimations.forEach((animation) => animation.pause());
  await Promise.all(midnightAnimations.map((animation) => animation.finished));
  midnightAnimations = [];
}

// ---- Hints ------------------------------------------------------------------

function showClockHint(hint) {
  minuteHand.classList.toggle("closeup__hand--hinting", Boolean(hint?.pulse));
  if (hint) storyHint.textContent = hint.text;
  else if (activeStory === "clock") storyHint.textContent = "";
}

function resetClockIdle() {
  clockIdleSeconds = 0;
  showClockHint(null);
}

setInterval(() => {
  if (!isRunning || clockPhase !== "playing") return;

  clockIdleSeconds += 1;
  const reached = CLOCK_HINTS.filter((hint) => clockIdleSeconds >= hint.after).at(-1);
  if (reached) showClockHint(reached);
}, 1000);

// Tower clock gets a gentle pulse when the scene has been idle a while.
setInterval(() => {
  const idle = !activeStory && idleSeconds >= 20;
  clockTarget.classList.toggle("clock-target--hinting", idle);
}, 1000);

// Pause freezes the zoom and the hand settle; Play resumes them.
scene.addEventListener("runningchange", (event) => {
  const { running } = event.detail;
  [zoomAnimation, ...handSnapAnimations, ...midnightAnimations].forEach((animation) => {
    if (animation) running ? animation.play() : animation.pause();
  });
});
