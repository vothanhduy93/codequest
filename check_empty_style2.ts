import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkEmptyStyle() {
    const querySnapshot = await getDocs(collection(db, "challenges"));
    let issues = [];
    querySnapshot.forEach((d) => {
        const data = d.data();
        if (data.defaultCode && data.defaultCode.replace(/\s/g,'').includes('<style></style>') && data.validationSnippet && data.validationSnippet.trim() === 'return true;') {
            issues.push(d.id);
        }
    });

    console.log(`Found ${issues.length} with empty <style> and return true;.`);
    console.log(issues.slice(0, 10));
}

checkEmptyStyle().then(() => process.exit(0)).catch(console.error);
