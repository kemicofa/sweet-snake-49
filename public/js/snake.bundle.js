const validateUsername = (username) => {
  if (!username || username.length > 32 || username.length < 2) {
    return false;
  }
  return /^[a-zA-Z0-9]{2,32}$/.test(username);
};
let scoreElement;
let speedElement;
let initiated = false;
const updateStatistics = (currentGame1) => {
  if (!initiated) {
    scoreElement = document.getElementById("score");
    speedElement = document.getElementById("speed");
    initiated = true;
  }
  scoreElement.innerText = ("" + currentGame1?.score) ?? 0;
  speedElement.innerText = "+" + (currentGame1?.speed ?? 0) + "%";
};
const requestNewGame = async (username) => {
  const result = await fetch(`./snake/${username}`, {
    method: "POST",
  });
  return result.json();
};
let currentGame;
let cells;
const calculateSpeed = (speed) => {
  return 1000 - speed * 10;
};
const updateSnakeGame = async (gameId, action) => {
  const result = await fetch(`./snake/${gameId}/update/${action}`, {
    method: "PUT",
  });
  return result.json();
};
const coordinatesConverter = (point) => {
  return point.x + point.y * 10;
};
const canContinue = () => {
  return currentGame?.status === "alive";
};
const rotationClasses = [
  "direction-north",
  "direction-east",
  "direction-south",
  "direction-west",
];
const findTailDirectionClass = (tail, next) => {
  const dx = tail.x - next.x;
  const dy = tail.y - next.y;
  const osx = Math.abs(dx) > 1;
  const osy = Math.abs(dy) > 1;
  let index;
  if (dx !== 0) {
    if (dx > 0) {
      index = osx ? 1 : 3;
    } else {
      index = osx ? 3 : 1;
    }
  } else if (dy !== 0) {
    if (dy > 0) {
      index = osy ? 0 : 2;
    } else {
      index = osy ? 2 : 0;
    }
  }
  if (index === undefined) {
    console.warn("Uh oh! Index for rotation class was not found!");
  }
  return rotationClasses[index];
};
const draw = () => {
  cells.forEach((cell) => cell.className = "");
  currentGame.snake.forEach((point, index, arr) => {
    const cell = cells[coordinatesConverter(point)];
    const classNames = [
      "snake",
    ];
    if (index === 0) {
      classNames.push("tail", findTailDirectionClass(point, arr[index + 1]));
    }
    if (index === arr.length - 1) {
      classNames.push("head");
      cell.innerHTML = `
              <span class="eye"></span>
              <span class="eye"></span>
              <span class="tongue"></span>
            `;
      classNames.push(rotationClasses[currentGame?.direction]);
    }
    cell.classList.add(...classNames);
  });
  cells[coordinatesConverter(currentGame.food)].classList.add("food");
};
const bindActionButtons = () => {
  const LEFT_ACTION_BUTTON = document.getElementById("left");
  const RIGHT_ACTION_BUTTON = document.getElementById("right");
  LEFT_ACTION_BUTTON.addEventListener("click", () => {
    if (!canContinue()) {
      return;
    }
    updateSnakeGame(currentGame.gameId, "R");
  });
  RIGHT_ACTION_BUTTON.addEventListener("click", () => {
    if (!canContinue()) {
      return;
    }
    updateSnakeGame(currentGame.gameId, "L");
  });
};
const run = () => {
  let previousSpeed = currentGame.speed;
  let delay = calculateSpeed(currentGame.speed);
  const si = setInterval(async () => {
    currentGame = await updateSnakeGame(currentGame.gameId, "A");
    draw();
    updateStatistics(currentGame);
    if (currentGame.speed !== previousSpeed) {
      previousSpeed = currentGame.speed;
      delay = calculateSpeed(currentGame.speed);
    }
    if (currentGame.status === "dead") {
      clearInterval(si);
      alert("GAME OVER!");
    }
  }, delay);
};
window.addEventListener("DOMContentLoaded", () => {
  bindActionButtons();
  document.getElementById("form").addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();
      const formData = new FormData(this);
      const username = formData.get("username");
      if (!validateUsername(username)) {
        alert("Username was invalid; 2-32 alphanumeric values only.");
      }
      currentGame = await requestNewGame(username);
      run();
    },
  );
  cells = Array.from(document.querySelectorAll("#snake-game > li"));
});
