import { Application, Router, send } from "./deps.ts";
import { activeGamesCount, clearInactiveGames, createSnakeGame, updateSnakeGame } from "./game.ts";
import { getHighscores } from './highscore.ts';
import mime from 'https://cdn.skypack.dev/mime-types'

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
  // TODO: send does not work on Deno Deploy, must wait till Deno.stat is implemented on DD.
  // await send(context, context.request.url.pathname, {
  //   root: `${Deno.cwd()}/public`,
  //   index: "index.html",
  // });
  const pathname = context.request.url.pathname === '/' ? '/index.html' : context.request.url.pathname
  const requestMimeType = mime.lookup(pathname)
  const responseMimeType = mime.contentType(requestMimeType)
  context.response.headers.set('Content-Type', responseMimeType);
  const location = `${Deno.cwd()}/public` + pathname;
  context.response.body = requestMimeType === 'image/png' ? 
    await Deno.readFile(location): 
    await Deno.readTextFile(location);
});

await app.listen({ port: 8000 });
