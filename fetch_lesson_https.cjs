const https = require('https');
https.get('https://raw.githubusercontent.com/freeCodeCamp/freeCodeCamp/main/curriculum/challenges/english/01-responsive-web-design/basic-css/style-multiple-elements-with-a-css-class.md', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
