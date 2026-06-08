import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function fixChallenges() {
    await updateDoc(doc(db, "challenges", "fcc_1054"), {
        validationSnippet: "const bg = window.getComputedStyle(document.body).backgroundColor; return bg === 'rgb(0, 0, 0)' || bg === '#000000' || bg === 'black' || bg.includes('0, 0, 0');"
    });
    console.log("Fixed fcc_1054.");

    await updateDoc(doc(db, "challenges", "fcc_1055"), {
        validationSnippet: "const h1 = document.querySelector('h1'); if (!h1 || !h1.textContent.toLowerCase().includes('hello world')) return false; const bodyStyles = window.getComputedStyle(document.body); const color = bodyStyles.color; const isGreen = color === 'rgb(0, 128, 0)' || color === 'green' || color.includes('0, 128, 0'); const isMono = bodyStyles.fontFamily.toLowerCase().includes('monospace'); return isGreen && isMono;"
    });
    console.log("Fixed fcc_1055.");

    await updateDoc(doc(db, "challenges", "fcc_1056"), {
        validationSnippet: "const h1 = document.querySelector('h1'); if (!h1 || !h1.classList.contains('pink-text') || !(h1.textContent || '').toLowerCase().includes('hello world')) return false; const h1Styles = window.getComputedStyle(h1); const color = h1Styles.color; const isPink = color === 'rgb(255, 192, 203)' || color === 'pink' || color.includes('255, 192, 203'); return isPink;"
    });
    console.log("Fixed fcc_1056.");
}

fixChallenges().then(() => process.exit(0)).catch(console.error);
