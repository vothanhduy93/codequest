import curriculum from '@freecodecamp/curriculum';

const blocks = curriculum.getChallenges();
const targetDashedNames = [
  'basic-html-and-html5',
  'basic-css',
  'css-flexbox',
  'css-grid',
  'basic-javascript',
  'es6'
];

for (const target of targetDashedNames) {
  const block = blocks.find((b: any) => b.fileName.includes(target) || b.dashedName === target);
  if (!block) continue;
  
  for (const c of block.challenges) {
     if (c.solutions && c.solutions.length > 0) {
        let sol = "";
        const rawSol = c.solutions[0];
        if (typeof rawSol === 'string') {
            sol = rawSol;
        } else if (Array.isArray(rawSol)) {
            // some other format
            sol = rawSol.map(s => s[s.length-1]).join("\n");
        } else if (rawSol.contents) {
            sol = rawSol.contents;
        }
        
        if (typeof sol === 'string' && sol.startsWith('var code = "')) {
           // check if we can cleanly extract
        } else {
           console.log("Different format:", target, c.title, typeof sol);
        }
     }
  }
}
