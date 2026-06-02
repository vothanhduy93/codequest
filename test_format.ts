import { customFormat } from './src/lib/formatter.js';

const html = `<h2>CatPhotoApp</h2>
<main>
  <p>
    Click here to view more
    <a href="#">
      cat photos</a>.
  </p>
  <ul>
    <li>catnip</li>
    <li>laser pointers</li>
  </ul>
</main>`;

console.log(customFormat(html, 'html'));
