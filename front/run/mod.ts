import { SnakeGameResponse } from "./types.ts";
import { validateUsername } from "./validator.ts";
import { updateStatistics } from './statistics.ts';

const requestNewGame = async (username: string) => {
  const result = await fetch(`./snake/${username}`, { method: "POST" });
  return result.json();
};

let currentGame: SnakeGameResponse;
let cells: HTMLDataListElement[];

const calculateSpeed = (speed: number) => {
  const DEFAULT_SPEED = 1000; // in ms
  return DEFAULT_SPEED - (speed * 10);
};

const updateSnakeGame = async (gameId: string, action: string) => {
    const result = await fetch(`./snake/${gameId}/update/${action}`, { method: 'PUT' });
    return result.json();
}

/**
 * 
 * Method that converts two dimension coordinates to a 1 dimension coordinate.
 * 
 * @param x 
 * @param y 
 * @returns 
 */
const coordinatesConverter = (point: { x: number; y: number }) => {
    // TODO: make this server dependent, so that this value isn't fixed.
    const MAP_LENGTH = 10;
    return point.x + (point.y * MAP_LENGTH);
}

const canContinue = () => {
    return currentGame?.status === 'alive'
}

const rotationClasses = [
  'direction-north',
  'direction-east',
  'direction-south',
  'direction-west'
];

const findTailDirectionClass = (tail: {x: number; y: number}, next: {x: number; y: number}) => {
  
  const dx = tail.x - next.x;
  const dy = tail.y - next.y;

  // entity is on the opposite side of the map.
  const osx = Math.abs(dx) > 1;
  const osy = Math.abs(dy) > 1;

  // index should always be calculated 
  // otherwise a serious issue is happening with the game
  let index!: number;

  if(dx !== 0) {
    if(dx > 0) {
      index = osx ? 1 : 3;
    } else {
      index = osx ? 3 : 1;
    }
  } else if(dy !== 0) {
    if(dy > 0) {
      index = osy ? 0 : 2;
    } else {
      index = osy ? 2 : 0;
    }
  }

  if(index === undefined) {
    console.warn('Uh oh! Index for rotation class was not found!');
  }

  return rotationClasses[index]
}

const draw = () => {
    // clear the map first
    cells.forEach((cell) => cell.className = '');
    currentGame.snake.forEach((point, index, arr) => {
        const cell = cells[coordinatesConverter(point)];
        const classNames = ['snake'];
        if(index === 0) {
          classNames.push('tail', findTailDirectionClass(point, arr[index + 1]));
        }
        if(index === arr.length - 1) {
            classNames.push('head');
            cell.innerHTML = `
              <span class="eye"></span>
              <span class="eye"></span>
              <span class="tongue"></span>
            `;
            classNames.push(rotationClasses[currentGame?.direction]);
        }
        cell.classList.add(...classNames);
    });

    cells[coordinatesConverter(currentGame.food)].classList.add('food');
}

const bindActionButtons = () => {
    const LEFT_ACTION_BUTTON = document.getElementById('left')! as HTMLButtonElement;
    const RIGHT_ACTION_BUTTON = document.getElementById('right')! as HTMLButtonElement;

    LEFT_ACTION_BUTTON.addEventListener("click", () => {
        if(!canContinue()) {
            return;
        }
        // left button is actually right on the server side
        updateSnakeGame(currentGame.gameId, 'R');
    });

    RIGHT_ACTION_BUTTON.addEventListener('click', () => {
        if(!canContinue()) {
            return;
        }
        // right button is actually left ont he server side 
        updateSnakeGame(currentGame.gameId, 'L');
    });
}

const run = () => {
  // default speed to update if the speed changes
  let previousSpeed = currentGame.speed;
  let delay = calculateSpeed(currentGame.speed);
  const si = setInterval(async () => {
    currentGame = await updateSnakeGame(currentGame.gameId, 'A');
    draw();
    updateStatistics(currentGame);
    if (currentGame.speed !== previousSpeed) {
      previousSpeed = currentGame.speed;
      delay = calculateSpeed(currentGame.speed);
    }
    if (currentGame.status === 'dead') {
        clearInterval(si);
        alert('GAME OVER!');
    }
  }, delay);
};

window.addEventListener("DOMContentLoaded", () => {
    bindActionButtons();
  document.getElementById("form")!.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();
      const formData = new FormData(this as HTMLFormElement);
      const username = formData.get("username") as string;
      if (!validateUsername(username)) {
        alert("Username was invalid; 2-32 alphanumeric values only.");
      }
      currentGame = await requestNewGame(username);
      run();
    },
  );

  cells = Array.from(document.querySelectorAll("#snake-game > li"));
});
