import curriculum from '@freecodecamp/curriculum';

const blocks = curriculum.getChallenges();
let allFCC = [];
for (const block of blocks) {
    if (block.challenges) {
        allFCC.push(...block.challenges);
    }
}

let emptySolutions = 0;
for (const c of allFCC) {
    if (c.dashedName && c.dashedName.includes('value-attribute')) {
       // Just taking one example
    }
}

let matchedTargetCount = 0;
let emptyTargetSols = 0;
let targetNames = ['basic-html-and-html5', 'basic-css', 'css-flexbox', 'css-grid', 'basic-javascript', 'es6'];
for (const name of targetNames) {
    const block = blocks.find((b: any) => b.fileName.includes(name) || b.dashedName === name);
    if (!block) continue;
    for (const c of block.challenges) {
        matchedTargetCount++;
        if (!c.solutions || c.solutions.length === 0) {
            emptyTargetSols++;
        }
    }
}

console.log(`In the 6 target blocks, Total: ${matchedTargetCount}, Empty Sols: ${emptyTargetSols}`);
