import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkValidations() {
    const q = query(collection(db, "challenges"), limit(20));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.validationSnippet && data.validationSnippet.trim() !== 'return true;') {
            console.log("ID:", data.id);
            console.log("Validation:", data.validationSnippet);
            console.log("----");
        }
    });
}

checkValidations().then(() => process.exit(0)).catch(console.error);
