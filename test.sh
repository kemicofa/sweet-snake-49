deno test --config tsconfig.json ./front/run/*
# TODO: fix the file map urls with CWD for snake game
deno test --allow-read ./front/snake/* ./back/*