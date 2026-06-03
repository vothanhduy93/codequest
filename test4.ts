import curriculum from '@freecodecamp/curriculum';
const blocks = curriculum.getChallenges();
const jsBlock = blocks.find((b: any) => b.fileName.includes('basic-html-and-html5'));
console.log(jsBlock.challenges.map(c => c.title).join('\n'));



