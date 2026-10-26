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

doorTarget.addEventListener("click", () => {
  if (!isRunning || storyLocked || !rowGroups.length) return;

  resetIdle();
  lightRow(litRows);
  litRows += 1;
  storyHint.textContent = `${litRows} of 4 rows of lights glowing.`;

  if (litRows === ROW_NAMES.length) {
    storyLocked = true;
    starGlow.classList.add("glow--lit");
    playChime(STAR_NOTE);
    // R3b replaces this hold with the door opening, snow gust and reset.
    setTimeout(() => {
      resetLights();
      storyLocked = false;
      resetIdle();
    }, 2500);
  }
});

setInterval(() => {
  if (!isRunning || storyLocked) return;

  idleSeconds += 1;
  const reached = HINTS.filter((hint) => idleSeconds >= hint.after).at(-1);
  if (reached) showHint(reached);
}, 1000);

// Pausing also silences any chime still ringing.
scene.addEventListener("runningchange", (event) => {
  if (!audioContext) return;
  if (event.detail.running) void audioContext.resume();
  else void audioContext.suspend();
});

void buildOrnamentGlows();
