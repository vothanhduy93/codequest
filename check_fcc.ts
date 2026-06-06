import curriculum from '@freecodecamp/curriculum';

const blocks = curriculum.getChallenges();
for (const flex of blocks) {
    for (const c of flex.challenges) {
        if (c.title === 'Use HTML5 to Require a Field' || c.title.includes('Require a Field')) {
            console.log(c.title);
            console.log(Object.keys(c));
            console.log("solutions:", c.solutions);
        }
    }
}
