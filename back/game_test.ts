import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.117.0/testing/asserts.ts";
import {
  calculateSpeedValue,
  createSnakeGame,
  updateSnakeGame,
} from "./game.ts";
import { uuid } from "./deps.ts";
Deno.test("Calculate speed value", () => {
  assertEquals(calculateSpeedValue(1), 1);
  assertEquals(calculateSpeedValue(2), 1);
  assertEquals(calculateSpeedValue(9), 1);
  assertEquals(calculateSpeedValue(10), 2);
  assertEquals(calculateSpeedValue(19), 2);
  assertEquals(calculateSpeedValue(20), 3);
});

Deno.test("Create new game", async () => {
  const { gameId, createdAt, updatedAt, ...rest } = await createSnakeGame(
    "jimmy",
  );
  assertEquals(typeof createdAt, "number");
  assertEquals(typeof updatedAt, "number");
  assertEquals(uuid.validate(gameId), true);
  assertEquals(rest, {
    food: {
      x: 6,
      y: 7,
    },
    level: 1,
    score: 0,
    snake: [
      {
        x: 5,
        y: 3,
      },
      {
        x: 4,
        y: 3,
      },
      {
        x: 3,
        y: 3,
      },
      {
        x: 2,
        y: 3,
      },
    ],
    speed: 1,
    status: "alive",
    username: "jimmy",
  });
});

Deno.test("Should fail trying to create a new game if the username is invalid", async () => {
  assertRejects(
    () => createSnakeGame(""),
    Error,
    "Invalid username. Are you trying to cheat?",
  );
  assertRejects(
    () => createSnakeGame(new Array(33).fill("a").join("")),
    Error,
    "Invalid username. Are you trying to cheat?",
  );
});

Deno.test("should be able to advance a snake game", async () => {
  const { gameId, createdAt, updatedAt: previousUpdatedAt } =
    await createSnakeGame("jimmy");
  const { updatedAt, ...rest } = updateSnakeGame(gameId, "A");
  assertEquals(updatedAt > previousUpdatedAt, true);
  assertEquals(rest, {
    createdAt,
    food: {
      x: 6,
      y: 7,
    },
    gameId,
    level: 1,
    score: 0,
    snake: [
      {
        x: 4,
        y: 3,
      },
      {
        x: 3,
        y: 3,
      },
      {
        x: 2,
        y: 3,
      },
      {
        x: 3,
        y: 3,
      },
    ],
    speed: 1,
    status: "alive",
    username: "jimmy",
  });
});
