import duplicate from "./duplicate.ts";
import { mapParser } from "./map.ts";
import { SEntity, SMap } from "./types.ts";

interface SnakeOptions {
  /**
   * Initial length of the snake.
   * Defaults to 3 (2 body + 1 head).
   */
  initialSize?: number;
  /**
   * Direction the snake will advance. Order N, E, S, W.
   * Defaults to 1.
   */
  defaultDirection?: 0 | 1 | 2 | 3;
  /**
   * Size of the map that the snake will be exploring.
   * Defaults to 10x10.
   */
  mapSize?: {
    rows: number;
    cols: number;
  };
  /**
   * Default snake array, this will override default direction/initial size
   */
  defaultSnake?: SEntity[];
  defaultFood?: SEntity;
}

const DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

class Snake {
  private entities: SEntity[];
  private directionIndex: number;
  private nextDirectionIndex: number|undefined;
  // we don't want to advance if we're already advancing
  private locked: boolean;

  private xBoundary: number;
  private yBoundary: number;
  private food: SEntity;
  private isAlive: Boolean;
  private unusedCoordinates: Set<string>;
  private _foodAteCount: number;

  get foodAteCounter() {
    return this._foodAteCount;
  }

  constructor(options?: SnakeOptions) {
    this.locked = true;
    this.directionIndex = this.nextDirectionIndex = options?.defaultDirection ?? 1;
    const [dx, dy] = DIRECTIONS[this.directionIndex];
    
    this.xBoundary = options?.mapSize?.rows ?? 10;
    this.yBoundary = options?.mapSize?.cols ?? 10;

    this.entities = options?.defaultSnake
      ? duplicate(options.defaultSnake)
      : new Array(options?.initialSize ?? 3)
        .fill(undefined)
        .map((_, index) => ({
          x: (dx * index) + (this.xBoundary / 2),
          y: dy * index + (this.yBoundary / 2),
        }));

    this.food = options?.defaultFood ? duplicate(options.defaultFood) : {
      x: this.xBoundary - 1,
      y: this.yBoundary - 1,
    };
    this._foodAteCount = 0;
    this.unusedCoordinates = new Set();
    this.initUnusedCoordinates();
    this.isAlive = true;
    this.locked = false;
  }

  static initFromMap(mapData: SMap) {
    const { snake, food, mapSize } = mapParser(mapData.map);
    return new Snake({
      // TODO: parser should generate a snake in the proper order
      // but it's too annoying updating the tests to fix this
      defaultSnake: snake.reverse(),
      defaultFood: food,
      mapSize,
      defaultDirection: mapData.metadata.D,
    });
  }

  private initUnusedCoordinates() {
    const usedCoordinatesSet = new Set(
      this.entities.map(({ x, y }) => `${x}:${y}`),
    );
    usedCoordinatesSet.add(`${this.food.x}:${this.food.y}`);
    for (let i = 0; i < this.xBoundary; i++) {
      for (let j = 0; j < this.yBoundary; j++) {
        const key = `${i}:${j}`;
        if (!usedCoordinatesSet.has(key)) {
          this.unusedCoordinates.add(key);
        }
      }
    }
  }

  private liberateUsedCoordinate({ x, y }: SEntity) {
    this.unusedCoordinates.add(`${x}:${y}`);
  }

  private addUsedCoordinate({ x, y }: SEntity) {
    this.unusedCoordinates.delete(`${x}:${y}`);
  }

  private didEatFood(head: SEntity) {
    return head.x === this.food.x && head.y === this.food.y;
  }

  private didEatSelf(head: SEntity) {
    if (this.entities.length < 4) {
      return false;
    }
    const entitiesThatCouldBeBit = this.entities.slice(0, -3);
    return entitiesThatCouldBeBit.some(({ x, y }) =>
      head.x === x && head.y === y
    );
  }

  private findNewFoodPosition() {
    const index = Math.floor(Math.random() * this.unusedCoordinates.size);
    const key = Array.from(this.unusedCoordinates.values())[index];
    const [x, y] = key.split(":").map(Number);
    this.food.x = x;
    this.food.y = y;
    this.addUsedCoordinate(this.food);
  }

  advance() {
    if (this.locked) {
      console.debug("Attempted to advance when already advancing");
      return;
    }
    if (!this.isAlive) {
      console.debug("Cannot advance a snake that is dead");
      return;
    }
    this.locked = true;

    // handle the direction and reset the next direction index to undefined.
    this.directionIndex = this.nextDirectionIndex ?? this.directionIndex;
    this.nextDirectionIndex = undefined;

    const lastEntity = this.entities[0];
    const lastIndex = this.entities.length - 1;
    const [dx, dy] = DIRECTIONS[this.directionIndex];
    const head = {
      x: (this.entities[lastIndex].x + dx + this.xBoundary) % this.xBoundary,
      y: (this.entities[lastIndex].y + dy + this.yBoundary) % this.yBoundary,
    };

    this.addUsedCoordinate(head);
    this.entities.push(head);

    if (!this.didEatFood(head)) {
      this.entities.shift();
      this.liberateUsedCoordinate(lastEntity);
    } else {
      this.liberateUsedCoordinate(this.food);
      this.findNewFoodPosition();
      this._foodAteCount += 1;
    }

    if (this.didEatSelf(head)) {
      this.isAlive = false;
    }

    this.locked = false;
  }

  turnLeft() {
    this.nextDirectionIndex = (this.directionIndex - 1 + DIRECTIONS.length) %
      DIRECTIONS.length;
  }

  turnRight() {
    this.nextDirectionIndex = (this.directionIndex + 1) % DIRECTIONS.length;
  }

  isGameOver() {
    return !this.isAlive;
  }

  toArray() {
    return {
      snake: duplicate(this.entities),
      food: duplicate(this.food),
      status: this.isAlive ? "alive" : "dead",
      direction: this.directionIndex
    };
  }

  toString() {
    return JSON.stringify({
      snake: this.entities,
      food: this.food,
      status: this.isAlive ? "alive" : "dead",
      direction: this.directionIndex
    });
  }
}

export default Snake;
