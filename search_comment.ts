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
        if (data.title && data.title.includes("Thêm chú thích")) {
            results.push(data);
        }
    });

    for (const res of results) {
        console.log("ID:", res.id);
        console.log("Title:", res.title);
        console.log("Validation:", res.validationSnippet);
        console.log("---------------");
    }
}

findChallenge().then(() => process.exit(0)).catch(console.error);
