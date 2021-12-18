import { assertEquals } from "https://deno.land/std@0.117.0/testing/asserts.ts";
import { mapParser, readMapFile, snakePartSorter } from "./map.ts";
Deno.test("Should parse map", async () => {
  const { map } = await readMapFile("./snake_map_complete.txt");
  assertEquals(mapParser(map), {
    food: {
      x: 6,
      y: 7,
    },
    mapSize: {
      cols: 10,
      rows: 10,
    },
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
  });
});

Deno.test("Should parse from reverse map", async () => {
  const { map } = await readMapFile("./snake_map_complete_reverse.txt");
  assertEquals(mapParser(map), {
    food: {
      x: 6,
      y: 7,
    },
    mapSize: {
      cols: 10,
      rows: 10,
    },
    snake: [
      {
        x: 2,
        y: 3,
      },
      {
        x: 3,
        y: 3,
      },
      {
        x: 4,
        y: 3,
      },
      {
        x: 5,
        y: 3,
      },
    ],
  });
});

Deno.test("Should parse from complex map", async () => {
  const { map } = await readMapFile("./snake_map_complete_complex.txt");

  assertEquals(mapParser(map), {
    food: {
      x: 6,
      y: 7,
    },
    mapSize: {
      cols: 10,
      rows: 10,
    },
    snake: [
      {
        x: 2,
        y: 3,
      },
      {
        x: 3,
        y: 3,
      },
      {
        x: 4,
        y: 3,
      },
      {
        x: 5,
        y: 3,
      },
      {
        x: 6,
        y: 3,
      },
      {
        x: 6,
        y: 4,
      },
      {
        x: 5,
        y: 4,
      },
    ],
  });
});

Deno.test("Should properly sort a snake part", () => {
  const res = snakePartSorter([
    { x: 0, y: 0 },
  ]);

  assertEquals(res, [{ x: 0, y: 0 }]);
});

Deno.test("Should properly sort snake parts", () => {
  const res = snakePartSorter([
    { x: 0, y: 0 },
    { x: 0, y: 1 },
  ]);

  assertEquals(res, [{ x: 0, y: 0 }, { x: 0, y: 1 }]);
});

Deno.test("Should properly sort snake parts in reverse", () => {
  const res = snakePartSorter([
    { x: 0, y: 1 },
    { x: 0, y: 0 },
  ]);

  assertEquals(res, [{ x: 0, y: 1 }, { x: 0, y: 0 }]);
});

Deno.test("Should properly sort snake parts with length of 3", () => {
  const res = snakePartSorter([
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
  ]);

  assertEquals(res, [{ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }]);
});

Deno.test("Should properly order an upside down snake", () => {
  const res = snakePartSorter([
    { x: 0, y: 2 },
    { x: 0, y: 0 },
    { x: 0, y: 1 },
  ]);

  assertEquals(res, [{ x: 0, y: 2 }, { x: 0, y: 1 }, { x: 0, y: 0 }]);
});
