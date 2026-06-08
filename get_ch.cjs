const fs = require('fs');

async function run() {
  const url = "https://firestore.googleapis.com/v1/projects/gtm-nwjwp2xx-otiwn/databases/ai-studio-a5196902-a047-4d6e-913a-fe04c024390d/documents";
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);
}
run();
