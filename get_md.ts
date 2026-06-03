async function run() {
  const url = 'https://raw.githubusercontent.com/freeCodeCamp/freeCodeCamp/main/curriculum/challenges/english/blocks/basic-html-and-html5/bad87fee1348bd9aedf08833.md';
  const r = await fetch(url);
  console.log(await r.text());
}
run();
