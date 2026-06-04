import curriculum from '@freecodecamp/curriculum';
const blocks = curriculum.getChallenges();
for (const b of blocks) {
  if (b.fileName.includes('basic-html')) {
    const challenge = b.challenges.find(c => c.solutions && c.solutions.length > 0);
    if (challenge) {
      console.log(challenge.title);
      console.log(typeof challenge.solutions[0]);
      console.log(challenge.solutions[0]);
      console.log(JSON.stringify(challenge.solutions[0], null, 2));
    }
    break;
  }
}
