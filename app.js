const enterButton = document.querySelector("#enter-button");
const welcome = document.querySelector("#welcome");
const scene = document.querySelector("#scene");
const stage = document.querySelector("#stage");
const pauseControl = document.querySelector("#pause-control");
const motionNote = document.querySelector("#motion-note");
const experienceStatus = document.querySelector("#experience-status");
const ambienceAudio = document.querySelector("#ambience-audio");
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

// Single switch for everything that moves or sounds. Later effects and
// stories hook into this so Play/Pause stops them all together.
function setRunning(running) {
  isRunning = running;
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

async function resumeExperience() {
  try {
    if (ambienceAudio.error) {
      ambienceAudio.load();
    }

    await ambienceAudio.play();
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
  await resumeExperience();
  pauseControl.focus();
});

pauseControl.addEventListener("click", () => {
  if (isRunning) {
    ambienceAudio.pause();
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
