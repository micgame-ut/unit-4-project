const enterButton = document.querySelector("#enter-button");
const welcome = document.querySelector("#welcome");
const scene = document.querySelector("#scene");
const stage = document.querySelector("#stage");
const pauseControl = document.querySelector("#pause-control");
const motionNote = document.querySelector("#motion-note");
const experienceStatus = document.querySelector("#experience-status");
const ambienceAudio = document.querySelector("#ambience-audio");
const windAudio = document.querySelector("#wind-audio");
const chimeAudio = document.querySelector("#chime-audio");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

// The art is authored at 941x1672 (see the layer manifest). The whole stage
// scales as one unit so every layer and hotspot keeps its alignment.
const ART_WIDTH = 941;
const ART_HEIGHT = 1672;
let isRunning = false;

function fitStage() {
  const { clientWidth, clientHeight } = scene;
  if (!clientWidth || !clientHeight) return;

  const scale = Math.min(clientWidth / ART_WIDTH, clientHeight / ART_HEIGHT);
  stage.style.setProperty("--stage-scale", scale);
}

// Light overlays (moon halo, window / lantern / jack-o'-lantern glow) are placed
// from hotspots.json so they share one coordinate source with the art. Each is
// inserted just before a named layer so it sits at the right depth in the stack.
const HOTSPOTS_URL = "assets/layers/gothic_assets/gothic_parallax/hotspots.json";

function addGlow(kind, spot, index, beforeLayer, scale) {
  const glow = document.createElement("div");
  const size = spot.radius * 2 * scale;
  glow.className = `glow glow--${kind}`;
  glow.style.left = `${spot.x - size / 2}px`;
  glow.style.top = `${spot.y - size / 2}px`;
  glow.style.width = `${size}px`;
  glow.style.height = `${size}px`;
  // Spread timings so neighbours never flicker in step.
  glow.style.setProperty("--glow-delay", `${-((index * 0.73) % 5).toFixed(2)}s`);
  glow.style.setProperty("--glow-speed", `${(3.2 + ((index * 0.37) % 2.4)).toFixed(2)}s`);
  stage.insertBefore(glow, stage.querySelector(`.layer--${beforeLayer}`));
}

// Loaded once and shared: the ambient glows here and the stories in
// door-story.js all read the same hotspot coordinates.
const hotspotsPromise = fetch(HOTSPOTS_URL).then((response) => {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
});

async function addLightGlows() {
  try {
    const hotspots = await hotspotsPromise;

    addGlow("moon", hotspots.moon, 0, "spiral-hill-body-trees-fence", 2.5);
    hotspots.windows.forEach((spot, i) =>
      addGlow("window", spot, i, "dark-background-forest", 3)
    );
    hotspots.jackolanterns.forEach((spot, i) =>
      addGlow("pumpkin", spot, i + 3, "dark-background-forest", 3)
    );
    hotspots.lanterns.forEach((spot, i) =>
      addGlow("lantern", spot, i + 1, "left-bushes-pumpkin", 3.4)
    );
  } catch (error) {
    // The art is complete without glows, so a failed load only costs the effect.
    console.warn("Light glows unavailable:", error);
  }
}

// Single switch for everything that moves or sounds. Later effects and
// stories hook into this so Play/Pause stops them all together.
function setRunning(running) {
  isRunning = running;
  scene.dispatchEvent(new CustomEvent("runningchange", { detail: { running } }));
  scene.classList.toggle("scene--running", running);
  scene.classList.toggle("scene--paused", !running);
  pauseControl.textContent = running ? "Pause" : "Play";
  pauseControl.setAttribute(
    "aria-label",
    running ? "Pause motion and ambience" : "Resume motion and ambience"
  );
}

function updateMotionPreference() {
  const reduceMotion = motionPreference.matches;
  scene.classList.toggle("scene--reduced-motion", reduceMotion);
  motionNote.hidden = !reduceMotion;
}

// Sound layers on top of the forest bed: a quiet looping wind, and the town
// clock striking thirteen now and then. The chime schedule counts only seconds
// spent running, so Pause holds it and Play picks up where it left off.
windAudio.volume = 0.3;
chimeAudio.volume = 0.5; // CHIME_VOLUME, set again at each strike
const FIRST_CHIME_AFTER = 25;
const CHIME_EVERY = 75;
// The recording strikes thirteen over 27 s, which is too long. Play only its
// opening strikes and fade out, then rewind so Play never resumes a cut-off chime.
const CHIME_PLAY_SECONDS = 9;
const CHIME_FADE_SECONDS = 1.5;
const CHIME_VOLUME = 0.5;
let runningSeconds = 0;
let nextChimeAt = FIRST_CHIME_AFTER;

setInterval(() => {
  if (!isRunning) return;

  runningSeconds += 1;
  if (runningSeconds >= nextChimeAt) {
    nextChimeAt = runningSeconds + CHIME_EVERY;
    chimeAudio.currentTime = 0;
    chimeAudio.volume = CHIME_VOLUME;
    chimeAudio.play().catch(() => {});
  }
}, 1000);

chimeAudio.addEventListener("timeupdate", () => {
  const fadeStart = CHIME_PLAY_SECONDS - CHIME_FADE_SECONDS;
  if (chimeAudio.currentTime >= CHIME_PLAY_SECONDS) {
    chimeAudio.pause();
    chimeAudio.currentTime = 0;
  } else if (chimeAudio.currentTime > fadeStart) {
    const left = (CHIME_PLAY_SECONDS - chimeAudio.currentTime) / CHIME_FADE_SECONDS;
    chimeAudio.volume = CHIME_VOLUME * Math.max(0, left);
  }
});

function pauseSounds() {
  ambienceAudio.pause();
  windAudio.pause();
  chimeAudio.pause();
}

async function resumeExperience() {
  try {
    if (ambienceAudio.error) {
      ambienceAudio.load();
    }

    await ambienceAudio.play();
    // The extra layers are optional: if one fails, the forest bed still plays.
    windAudio.play().catch(() => {});
    if (chimeAudio.currentTime > 0 && !chimeAudio.ended) {
      chimeAudio.play().catch(() => {});
    }
    experienceStatus.textContent = "";
    setRunning(true);
  } catch (error) {
    pauseSounds();
    setRunning(false);
    experienceStatus.textContent =
      error instanceof DOMException && error.name === "NotAllowedError"
        ? "Your browser blocked the audio. Select Play to try again."
        : "The audio couldn't start or resume. The experience is paused; select Play to retry.";
  }
}

enterButton.addEventListener("click", async () => {
  welcome.hidden = true;
  scene.hidden = false;
  fitStage();
  await resumeExperience();
  pauseControl.focus();
});

pauseControl.addEventListener("click", () => {
  if (isRunning) {
    pauseSounds();
    setRunning(false);
    return;
  }

  void resumeExperience();
});

ambienceAudio.addEventListener("error", () => {
  if (scene.hidden) return;

  setRunning(false);
  experienceStatus.textContent =
    "Ambient audio couldn't be loaded. Select Play to retry.";
});

window.addEventListener("resize", fitStage);
motionPreference.addEventListener("change", updateMotionPreference);
updateMotionPreference();
setRunning(false);
void addLightGlows();
