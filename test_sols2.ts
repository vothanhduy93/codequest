import curriculum from '@freecodecamp/curriculum';
const blocks = curriculum.getChallenges();
const block = blocks.find((b: any) => b.fileName.includes('basic-javascript'));
if (block) {
  for (let i = 0; i < 2; i++) {
     const c = block.challenges[i];
     console.log("TITLE:", c.title);
     console.log("SOL:");
     console.log(c.solutions[0]);
  }
}
