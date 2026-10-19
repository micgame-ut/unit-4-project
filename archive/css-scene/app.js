const enterButton = document.querySelector("#enter-button");
const welcome = document.querySelector("#welcome");
const scene = document.querySelector("#scene");

enterButton.addEventListener("click", () => {
  welcome.hidden = true;
  scene.hidden = false;
});
