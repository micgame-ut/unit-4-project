const enterButton = document.querySelector("#enter-button");
const welcome = document.querySelector("#welcome");
const scene = document.querySelector("#scene");
const stage = document.querySelector("#stage");
const pauseControl = document.querySelector("#pause-control");
const treeDoorTrigger = document.querySelector("#tree-door-trigger");
const treeGlimmers = [...document.querySelectorAll(".tree-glimmer")];
const motionNote = document.querySelector("#motion-note");
const experienceStatus = document.querySelector("#experience-status");
const ambienceAudio = document.querySelector("#ambience-audio");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

const ART_WIDTH = 720;
const ART_HEIGHT = 1280;
const STORY_DURATION = 7000;
const HINTS = [
  "A few glimmers on the evergreen seem to be part of a pattern.",
  "They wake gently, one at a time, from the lower branches upward.",
  "The little lights may be waiting for someone to wake each one."
];
let isRunning = false;
let storyState = "idle";
let storyProgress = 0;
let hintIndex = 0;
let storyAudioContext = null;

function createPausableTimer() {
  let timeoutId = null;
  let deadline = 0;
  let remaining = 0;
  let onElapsed = null;

  function scheduleRemaining() {
    if (timeoutId !== null || onElapsed === null) return;
    if (remaining <= 0) {
      const callback = onElapsed;
      onElapsed = null;
      callback();
      return;
    }

    deadline = performance.now() + remaining;
    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      remaining = 0;
      const callback = onElapsed;
      onElapsed = null;
      callback();
    }, remaining);
  }

  return {
    schedule(delay, callback) {
      this.clear();
      remaining = delay;
      onElapsed = callback;
      if (isRunning) scheduleRemaining();
    },
    pause() {
      if (timeoutId === null) return;

      window.clearTimeout(timeoutId);
      timeoutId = null;
      remaining = Math.max(0, deadline - performance.now());
    },
    resume() {
      scheduleRemaining();
    },
    clear() {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = null;
      deadline = 0;
      remaining = 0;
      onElapsed = null;
    }
  };
}

const hintTimer = createPausableTimer();
const storyTimer = createPausableTimer();

function fitStage() {
  const { clientWidth, clientHeight } = scene;
  if (!clientWidth || !clientHeight) return;

  const scale = Math.min(clientWidth / ART_WIDTH, clientHeight / ART_HEIGHT);
  stage.style.setProperty("--stage-scale", scale);
  const hitTargetSize = 48 / scale;
  treeDoorTrigger.style.width = `${hitTargetSize}px`;
  treeDoorTrigger.style.height = `${hitTargetSize}px`;
}

function setRunning(running) {
  isRunning = running;
  scene.classList.toggle("scene--running", running);
  scene.classList.toggle("scene--paused", !running);
  pauseControl.textContent = running ? "Pause" : "Play";
  pauseControl.setAttribute(
    "aria-label",
    running ? "Pause motion and ambience" : "Resume motion and ambience"
  );
  treeDoorTrigger.disabled = !running || storyState === "playing";

  if (running) {
    hintTimer.resume();
    storyTimer.resume();
  } else {
    hintTimer.pause();
    storyTimer.pause();
    suspendStoryAudio();
  }
}

function updateMotionPreference() {
  const reduceMotion = motionPreference.matches;
  scene.classList.toggle("scene--reduced-motion", reduceMotion);
  motionNote.hidden = !reduceMotion;
}

function showNextHint(delay = 18000) {
  if (storyState === "playing" || hintIndex >= HINTS.length) return;

  hintTimer.schedule(delay, () => {
    experienceStatus.textContent = HINTS[hintIndex];
    hintIndex += 1;
    showNextHint(24000);
  });
}

function resetStory() {
  storyState = "idle";
  storyProgress = 0;
  treeGlimmers.forEach(glimmer => glimmer.classList.remove("is-lit"));
  treeDoorTrigger.setAttribute("aria-label", "Evergreen door");
  treeDoorTrigger.disabled = !isRunning;
}

function finishStory() {
  scene.classList.remove("scene--story-playing");
  resetStory();
  experienceStatus.textContent = "The tree settles back into place. The path is open to explore.";
  hintIndex = 0;
  showNextHint(24000);
}

function playStoryChime(step) {
  if (!isRunning) return;

  try {
    if (!window.AudioContext) {
      throw new Error("Web Audio is not supported in this browser.");
    }

    if (!storyAudioContext) {
      storyAudioContext = new AudioContext();
    }
    if (storyAudioContext.state === "suspended") {
      storyAudioContext.resume().catch(() => {
        experienceStatus.textContent = "The story chime couldn't resume; visual feedback is still available.";
      });
    }

    const notes = [
      [392, 784],
      [494, 988],
      [587, 1174],
      [659, 784, 988, 1318]
    ][step];
    const now = storyAudioContext.currentTime;

    notes.forEach((frequency, index) => {
      const startAt = now + index * 0.065;
      const oscillator = storyAudioContext.createOscillator();
      const gain = storyAudioContext.createGain();
      const peak = index === 0 ? 0.055 : 0.018;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.36);
      oscillator.connect(gain);
      gain.connect(storyAudioContext.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + 0.38);
    });
  } catch (error) {
    experienceStatus.textContent = "The story chime is unavailable, but the visual story will continue.";
  }
}

function suspendStoryAudio() {
  if (!storyAudioContext || storyAudioContext.state !== "running") return;

  storyAudioContext.suspend().catch(() => {
    experienceStatus.textContent = "The story chime could not be paused cleanly.";
  });
}

function beginStory() {
  storyState = "playing";
  treeDoorTrigger.disabled = true;
  pauseControl.focus();
  scene.classList.add("scene--story-playing");
  experienceStatus.textContent =
    "The little tree rises above its closed door, then the doorway opens in warm light.";
  playStoryChime(3);
  storyTimer.schedule(STORY_DURATION, finishStory);
}

function handleTreeDoorTap() {
  if (!isRunning || storyState === "playing") return;

  storyState = "sequence";
  hintTimer.clear();
  const glimmer = treeGlimmers[storyProgress];
  glimmer.classList.add("is-lit");
  storyProgress += 1;
  treeDoorTrigger.setAttribute(
    "aria-label",
    `Evergreen door, ${storyProgress} of 3 lights glowing`
  );

  if (storyProgress < treeGlimmers.length) {
    experienceStatus.textContent = `A glimmer answers. ${storyProgress} of 3 lights are awake.`;
    playStoryChime(storyProgress - 1);
    showNextHint(24000);
    return;
  }

  beginStory();
}

async function resumeExperience() {
  try {
    if (ambienceAudio.error) {
      ambienceAudio.load();
    }

    const ambiencePlayback = ambienceAudio.play();
    const storyAudioResume =
      storyAudioContext?.state === "suspended"
        ? storyAudioContext.resume()
        : Promise.resolve();
    await Promise.all([ambiencePlayback, storyAudioResume]);
    experienceStatus.textContent = "";
    setRunning(true);
  } catch (error) {
    ambienceAudio.pause();
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
  hintIndex = 0;
  showNextHint();
  await resumeExperience();
  (isRunning ? treeDoorTrigger : pauseControl).focus();
});

pauseControl.addEventListener("click", () => {
  if (isRunning) {
    ambienceAudio.pause();
    setRunning(false);
    return;
  }

  void resumeExperience();
});

treeDoorTrigger.addEventListener("click", handleTreeDoorTap);

ambienceAudio.addEventListener("error", () => {
  if (scene.hidden) return;

  setRunning(false);
  experienceStatus.textContent =
    "Ambient audio couldn't be loaded. Select Play to retry.";
});

window.addEventListener("resize", fitStage);
motionPreference.addEventListener("change", updateMotionPreference);
updateMotionPreference();
resetStory();
setRunning(false);
