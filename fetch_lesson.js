async function fetchContent() {
  const url = "https://raw.githubusercontent.com/freeCodeCamp/freeCodeCamp/main/curriculum/challenges/english/01-responsive-web-design/basic-css/style-multiple-elements-with-a-css-class.md";
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}
fetchContent();
