async function fetchContent() {
  const url = "https://api.github.com/repos/freeCodeCamp/freeCodeCamp/contents/curriculum/challenges/english";
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'node.js' } });
    const text = await res.json();
    console.log(text.map(t => t.name).join("\\n"));
  } catch (e) {
    console.error(e);
  }
}
fetchContent();
