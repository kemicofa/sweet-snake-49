import { validateUsername } from "../front/run/validator.ts";
import { readMapFile } from "../front/snake/map.ts";
import Snake from "../front/snake/mod.ts";
import { addHighscore } from "./highscore.ts";

declare global {
  interface Crypto {
    randomUUID: () => string;
  }
}

interface SnakeGame {
  gameId: string;
  score: number;
  speed: number;
  level: number;
  username: string;
  instance: InstanceType<typeof Snake>;
  updatedAt: number;
  createdAt: number;
}

const gamesCache: Map<string, SnakeGame> = new Map();

const levels = [
  await readMapFile(`${Deno.cwd()}/back/levels/level.1.txt`),
];

export const clearInactiveGames = () => {
  Array.from(gamesCache.entries()).forEach(([gameId, { updatedAt }]) => {
    const now = (new Date()).getTime();
    // 10 seconds between each action maximum before
    // the game can be deleted
    const TIME_TO_DELETE = 10000;
    if (now - updatedAt > TIME_TO_DELETE) {
      gamesCache.delete(gameId);
    }
  });
};

export const activeGamesCount = () => {
  return gamesCache.size;
};

const snakeGameToPayloadMapper = (snakeGame: SnakeGame) => {
  const { instance, ...rest } = snakeGame;
  return {
    ...rest,
    ...snakeGame.instance.toArray(),
  };
};

export const createSnakeGame = async (username: string) => {
  if (!validateUsername(username)) {
    throw new Error("Invalid username. Are you trying to cheat?");
  }
  const gameEntry = {
    gameId: crypto.randomUUID(),
    score: 0,
    speed: 0,
    level: 1,
    username,
    instance: Snake.initFromMap(levels[0]),
    updatedAt: (new Date()).getTime(),
    createdAt: (new Date()).getTime(),
  };

  gamesCache.set(gameEntry.gameId, gameEntry);

  return snakeGameToPayloadMapper(gameEntry);
};

export const calculateSpeedValue = (foodAteCounter: number) => {
  return Math.floor(foodAteCounter / 10);
};

export const updateSnakeGame = (gameId: string, action: string) => {
  const gameEntry = gamesCache.get(gameId);
  if (!gameEntry) {
    throw new Error("404 game not found.");
  }
  if (gameEntry.instance.isGameOver()) {
    throw new Error("Cannot update a game already complete.");
  }
  switch (action) {
    case "A": {
      gameEntry.instance.advance();
      break;
    }
    case "L": {
      gameEntry.instance.turnLeft();
      break;
    }
    case "R": {
      gameEntry.instance.turnRight();
      break;
    }
    default: {
      throw new Error(
        "Look if you're trying to cheat, you're not doing a good job.",
      );
    }
  }
  // TODO: if we change levels then the speed unfortunately resets
  gameEntry.speed = calculateSpeedValue(gameEntry.instance.foodAteCounter);
  // bigger score values makes it more interesting
  gameEntry.score = gameEntry.instance.foodAteCounter * 10;
  gameEntry.updatedAt = (new Date()).getTime();

  // TODO:
  // check how much time it took to move, if it's less than
  // the speed of the snake then clearly someome is cheating

  if (gameEntry.instance.isGameOver()) {
    // remove from cache when a game ends to save memory
    gamesCache.delete(gameId);
    addHighscore(gameEntry.username, gameEntry.score);
  }
  return snakeGameToPayloadMapper(gameEntry);
};
