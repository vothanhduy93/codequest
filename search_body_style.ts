import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function findChallenge() {
    const querySnapshot = await getDocs(collection(db, "challenges"));
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.title && data.title.includes("HTML body")) {
            results.push(data);
        } else if (data.instructions && data.instructions.includes("background-color: black")) {
            results.push(data);
        } else if (data.title?.includes("Định kiểu") && data.title?.includes("body")) {
            results.push(data);
        }
    });

    console.log(`Found ${results.length} matches`);
    
    for (const res of results) {
        console.log("ID:", res.id);
        console.log("Title:", res.title);
        console.log("---------------");
    }
}

findChallenge().then(() => process.exit(0)).catch(console.error);
