import curriculum from '@freecodecamp/curriculum';

const blocks = curriculum.getChallenges();

for (const block of blocks) {
  for (const c of block.challenges) {
      if (c.title && c.title.toLowerCase().includes('radio')) {
         console.log(block.dashedName, '||', c.title, '||', c.id);
      }
  }
}
