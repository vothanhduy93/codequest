import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkEmptyStyle() {
    const querySnapshot = await getDocs(collection(db, "challenges"));
    const issues: string[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.defaultCode && data.defaultCode.includes('<style>\n\n</style>') && data.validationSnippet === 'return true;') {
            issues.push(data.id);
        }
    });

    console.log(`Found ${issues.length} with <style>...</style> and return true;.`);
    console.log(issues);
}

checkEmptyStyle().then(() => process.exit(0)).catch(console.error);
