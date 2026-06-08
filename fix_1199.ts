import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function fix1199() {
    await updateDoc(doc(db, "challenges", "fcc_1199"), {
        solution: "// Đây là một comment một dòng\n/* Đây là một \ncomment nhiều dòng */",
        defaultCode: "<!-- Bài này bạn hãy chuyển sang tab script.js để viết code nhé! -->",
        validationSnippet: "const jsMatch = code.match(/<script(.*?)?>\\n?([\\s\\S]*?)\\n?<\\/script>/i); const jsCode = jsMatch ? jsMatch[2] : ''; return /\\/\\/.*/.test(jsCode) && /\\/\\*[\\s\\S]*?\\*\\//.test(jsCode);"
    });
    console.log("Fixed fcc_1199.");
}

fix1199().then(() => process.exit(0)).catch(console.error);
