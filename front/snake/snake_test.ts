import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.117.0/testing/asserts.ts";
import { readMapFile } from "./map.ts";
import Snake from "./snake.ts";

Deno.test("Should be able to initiate a Snake", () => {
  const snake = new Snake();
  assertEquals(snake instanceof Snake, true);
  assertEquals(
    snake.toString(),
    '{"snake":[{"x":5,"y":5},{"x":6,"y":5},{"x":7,"y":5}],"food":{"x":9,"y":9},"status":"alive","direction":1}',
  );
  assertEquals(snake.toArray(), {
    snake: [{ "x": 5, "y": 5 }, { "x": 6, "y": 5 }, { "x": 7, "y": 5 }],
    "food": { "x": 9, "y": 9 },
    "status": "alive",
    "direction": 1
  });
});

Deno.test("Should be able to initiate a Snake with default size", () => {
  const snake = new Snake({
    initialSize: 5,
  });
  assertEquals(
    snake.toString(),
    '{"snake":[{"x":5,"y":5},{"x":6,"y":5},{"x":7,"y":5},{"x":8,"y":5},{"x":9,"y":5}],"food":{"x":9,"y":9},"status":"alive","direction":1}',
  );
});

Deno.test("Should be able to initiate a snake with a default direction", () => {
  const snakeNorth = new Snake({
    defaultDirection: 0,
  });
  assertEquals(
    snakeNorth.toString(),
    '{"snake":[{"x":5,"y":5},{"x":5,"y":6},{"x":5,"y":7}],"food":{"x":9,"y":9},"status":"alive","direction":0}',
  );
  const snakeSouth = new Snake({
    defaultDirection: 2,
  });
  assertEquals(
    snakeSouth.toString(),
    '{"snake":[{"x":5,"y":5},{"x":5,"y":4},{"x":5,"y":3}],"food":{"x":9,"y":9},"status":"alive","direction":2}',
  );
  const snakeWest = new Snake({
    defaultDirection: 3,
  });
  assertEquals(
    snakeWest.toString(),
    '{"snake":[{"x":5,"y":5},{"x":4,"y":5},{"x":3,"y":5}],"food":{"x":9,"y":9},"status":"alive","direction":3}',
  );
});

Deno.test("Should be able to advance a snake", () => {
  const snake = new Snake();
  snake.advance();
  assertEquals(
    snake.toString(),
    '{"snake":[{"x":6,"y":5},{"x":7,"y":5},{"x":8,"y":5}],"food":{"x":9,"y":9},"status":"alive","direction":1}',
  );
  snake.advance();
  assertEquals(
    snake.toString(),
    '{"snake":[{"x":7,"y":5},{"x":8,"y":5},{"x":9,"y":5}],"food":{"x":9,"y":9},"status":"alive","direction":1}',
  );
});

Deno.test("Should be able to rotate left", () => {
  const snake = new Snake();
  snake.turnLeft();
  snake.advance();
  assertEquals(
    snake.toString(),
    '{"snake":[{"x":6,"y":5},{"x":7,"y":5},{"x":7,"y":6}],"food":{"x":9,"y":9},"status":"alive","direction":0}',
  );
  snake.turnLeft();
  snake.advance();
  assertEquals(
    snake.toString(),
    '{"snake":[{"x":7,"y":5},{"x":7,"y":6},{"x":6,"y":6}],"food":{"x":9,"y":9},"status":"alive","direction":3}',
  );
});

Deno.test("Should be able to rotate right", () => {
  const snake = new Snake();
  snake.turnRight();
  snake.advance();
  assertEquals(
    snake.toString(),
    '{"snake":[{"x":6,"y":5},{"x":7,"y":5},{"x":7,"y":4}],"food":{"x":9,"y":9},"status":"alive","direction":2}',
  );
  snake.turnRight();
  snake.advance();
  assertEquals(
    snake.toString(),
    '{"snake":[{"x":7,"y":5},{"x":7,"y":4},{"x":6,"y":4}],"food":{"x":9,"y":9},"status":"alive","direction":3}',
  );
});

const snakeEatFirstFood = (snake: InstanceType<typeof Snake>) => {
  snake.advance();
  snake.advance();
  snake.turnLeft();
  snake.advance();
  snake.advance();
  snake.advance();
  snake.advance();
};

Deno.test("Snake should be able to grow", () => {
  const snake = new Snake();
  snakeEatFirstFood(snake);
  const { food, snake: s } = snake.toArray();
  assertEquals(s, [{ "x": 9, "y": 6 }, { "x": 9, "y": 7 }, { "x": 9, "y": 8 }, {
    "x": 9,
    "y": 9,
  }]);
  assertNotEquals(food.x, 9);
  assertNotEquals(food.y, 9);
});

Deno.test("Snake should die if self bit", () => {
  const snake = new Snake({
    initialSize: 5,
  });
  snake.turnLeft();
  snake.advance();
  snake.turnLeft();
  snake.advance();
  snake.turnLeft();
  snake.advance();
  const { status, snake: s } = snake.toArray();
  assertEquals(s, [
    {
      x: 8,
      y: 5,
    },
    {
      x: 9,
      y: 5,
    },
    {
      x: 9,
      y: 6,
    },
    {
      x: 8,
      y: 6,
    },
    {
      x: 8,
      y: 5,
    },
  ]);
  assertEquals(status, "dead");
});

Deno.test("Initialise snake from map", async () => {
  const mapData = await readMapFile("./snake_map_complete.txt");
  const snake = Snake.initFromMap(mapData);
  assertEquals(
    snake.toString(),
    '{"snake":[{"x":2,"y":3},{"x":3,"y":3},{"x":4,"y":3},{"x":5,"y":3}],"food":{"x":6,"y":7},"status":"alive","direction":1}',
  );
  snake.advance();
  assertEquals(
    snake.toString(),
    '{"snake":[{"x":3,"y":3},{"x":4,"y":3},{"x":5,"y":3},{"x":6,"y":3}],"food":{"x":6,"y":7},"status":"alive","direction":1}',
  );
});
