import { SnakeGameResponse } from "./types.ts";

let scoreElement: HTMLElement;
let speedElement: HTMLElement;
let initiated: Boolean = false;

export const updateStatistics = (currentGame?: SnakeGameResponse) => {
  if (!initiated) {
    scoreElement = document.getElementById("score") as HTMLElement;
    speedElement = document.getElementById("speed") as HTMLElement;
    initiated = true;
  }
  scoreElement.innerText = "" + currentGame?.score ?? 0;
  speedElement.innerText = "+" + (currentGame?.speed ?? 0) + "%";
};
