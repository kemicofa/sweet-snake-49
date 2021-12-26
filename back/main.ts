import { Application, Router, send } from "./deps.ts";
import { activeGamesCount, clearInactiveGames, createSnakeGame, updateSnakeGame } from "./game.ts";
import { getHighscores } from './highscore.ts';

const app = new Application();

const router = new Router();

router
  .post("/snake/:username", async (context) => {
    const { username } = context.params;
    context.response.body = await createSnakeGame(username);
  })
  .put("/snake/:gameId/update/:action", async (context) => {
    const { gameId, action } = context.params;
    context.response.body = await updateSnakeGame(gameId, action);
  })
  .get("/snake/highscores", (context) => {
    context.response.body = getHighscores();
  })
  .delete("/snake/clear/inactive", () => {
    clearInactiveGames();
  })
  .get('/snake/active/games/count', (context) => {
    context.response.body = { activeGames: activeGamesCount() };
  });

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/public`,
    index: "index.html",
  });
});

await app.listen({ port: 8000 });
