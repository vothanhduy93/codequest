fetch('https://api.github.com/search/code?q=change-the-color-of-text.md+in:path+repo:freeCodeCamp/freeCodeCamp', {headers: {'User-Agent': 'node.js'}})
  .then(r=>r.json())
  .then(j=>{ 
     console.log(JSON.stringify(j, null, 2));
  });
