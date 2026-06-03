const normalizeClean = (s: string) => {
  if (!s) return '';
  return s.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/['"`]/g, '')
    .replace(/;\s*$/g, '')
    .trim();
};

const userCode = `
<h1>Hello World</h1>

<h2>CatPhotoApp</h2>

<p>Kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball
  run catnip eat the grass sniff.</p>
`;

const refCode = `
<h1>Hello World</h1>

<h2>CatPhotoApp</h2>

<p>Kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff.</p>
`;

console.log(normalizeClean(userCode) === normalizeClean(refCode));

