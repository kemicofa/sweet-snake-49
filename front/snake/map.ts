import { SEntity, SMap } from "./types.ts";

interface MapParserResult {
  snake: SEntity[];
  food?: SEntity;
  mapSize: {
    rows: number;
    cols: number;
  };
}

/**
 * Method that takes two points and determines if they are neighbors.
 * They are neighbors if the x XOR y values between both points is one.
 *
 * @param a
 * @param b
 * @returns
 */
const isNeighbor = (a: SEntity, b: SEntity) => {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);

  return dx + dy === 1;
};

/**
 * Will attempt to find the most logical
 * Snake part path from the entities
 * The first element should always be the head.
 *
 * The following could be represented as
 * @##
 *  ##
 * (0,1)(0,2)(1,2)(1,3)(0,3)
 * (0,1)(0,2)(0,3)(1,3)(1,2)
 *
 * @param snake
 * @returns
 */
export const snakePartSorter = (snakeParts: SEntity[]): SEntity[] => {
  if (snakeParts.length === 0) {
    return [];
  }
  // First entity is always the head
  const snake: SEntity[] = [snakeParts[0]];
  const unused: SEntity[] = snakeParts.slice(1);
  while (unused.length > 0) {
    const previous = snake[snake.length - 1];
    const current = unused.shift();

    // if there are no more elements that are unused
    // the snake should be complete
    if (!current) {
      break;
    }

    if (isNeighbor(previous, current)) {
      snake.push(current);
    } else {
      unused.push(current);
    }
  }
  return snake;
};

export const mapParser = (map: string[][]): MapParserResult => {
  let food: SEntity | undefined;
  const snake: SEntity[] = [];

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      const symbol = map[y][x];
      switch (symbol) {
        case "@": {
          snake.unshift({ x, y });
          break;
        }
        case "#": {
          snake.push({ x, y });
          break;
        }
        case "F": {
          food = { x, y };
        }
      }
    }
  }
  return {
    snake: snakePartSorter(snake),
    food,
    mapSize: {
      cols: map.length,
      rows: map[0].length,
    },
  };
};

export const readMapFile = async (path: string): Promise<SMap> => {
  const decoder = new TextDecoder();
  const rawMap = await Deno.readFile(path);
  const [metadata, ...unparsedMap] = decoder
    .decode(rawMap)
    .split("\n");

  return {
    metadata: metadata
      .split(";")
      .map((cmb) => cmb.split(":"))
      .reduce(
        (acc, [key, value]) => ({ ...acc, [key]: Number(value) }),
        {} as SMap["metadata"],
      ),
    map: unparsedMap.map((row) => row.split("")),
  };
};
