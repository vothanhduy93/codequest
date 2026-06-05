import https from 'https';

https.get('https://raw.githubusercontent.com/freeCodeCamp/freeCodeCamp/main/curriculum/challenges/english/01-responsive-web-design/basic-css/change-the-color-of-text.md', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
}).on('error', (err) => {
  console.error(err.message);
});
