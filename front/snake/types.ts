export interface SEntity {
  x: number;
  y: number;
}

export interface SMap {
  metadata: {
    // default direction of the snake
    // value between 0 and 3 inclusive
    D: 0 | 1 | 2 | 3;
    // default speed of snake
    S: number;
  };
  map: string[][];
}
