async function run() {
  const url = 'https://api.github.com/repos/freeCodeCamp/freeCodeCamp/contents/curriculum/challenges';
  const res = await fetch(url, { headers: { 'User-Agent': 'AI-Studio' }});
  const data = await res.json();
  console.log(data.map(d => d.path));
}
run();
