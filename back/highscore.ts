interface Highscore {
  score: number;
  username: string;
  attempts: number;
}

const cache: Map<string, Highscore> = new Map();

export const addHighscore = (username: string, score: number) => {
  const previousEntry = cache.get(username);
  cache.set(username, {
    score: Math.max(previousEntry?.score ?? 0, score),
    username,
    attempts: (previousEntry?.attempts ?? 0) + 1,
  });
};

export const getHighscores = () => {
  return Array
    .from(cache.values())
    .sort(({ score: scoreA }, { score: scoreB }) => scoreB - scoreA);
};
