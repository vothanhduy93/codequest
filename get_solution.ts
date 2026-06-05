import curriculum from '@freecodecamp/curriculum';

const blocks = curriculum.getChallenges();
const targetDashedNames = ['basic-html-and-html5'];

const block = blocks.find((b: any) => b.dashedName === 'basic-html-and-html5' || b.name.toLowerCase().includes('html'));
const trueOrderChallenges = block.challenges.map(c => c.id);
const alphabeticalChallenges = [...trueOrderChallenges].sort();

const id1002 = alphabeticalChallenges[2];
console.log('Hex ID for 1002:', id1002);

const c1002 = block.challenges.find(c => c.id === id1002);
console.log('Title:', c1002.title);
console.log('Solution:\n', c1002.solutions[0]);
