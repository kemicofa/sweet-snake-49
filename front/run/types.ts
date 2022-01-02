import Snake from "../snake/mod.ts";

type SnakeObj = ReturnType<InstanceType<typeof Snake>["toArray"]>;

export interface SnakeGameResponse extends SnakeObj {
  gameId: string;
  level: number;
  score: number;
  speed: number;
}
