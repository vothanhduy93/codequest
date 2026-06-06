import * as dotenv from 'dotenv';
dotenv.config();
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  const missing = [];
  querySnapshot.forEach(d => {
      const data = d.data();
      if (!data.solution || data.solution.trim() === '') {
          missing.push({ id: d.id, ...data });
      }
  });
  console.log(`Found ${missing.length} missing solutions.`);

  let processed = 0;
  for (const item of missing) {
      if (processed >= 200) break;
      try {
         const prompt = `You are a coding instructor. I will provide you with a programming challenge, including its instructions and default starting code.
Your task is to provide the FINAL CORRECT CODE that solves the challenge.

Challenge Title: ${item.title}
Instructions: ${item.instructions}
Description: ${item.description}
Default Code:
\`\`\`
${item.defaultCode}
\`\`\`

Return ONLY the raw solved HTML/CSS/JS code, without any markdown formatting or explanations. Do not include \`\`\`html or \`\`\`. Just the raw code.`;

         const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash-lite',
             contents: prompt,
         });

         let solution = response.text || '';
         solution = solution.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '').trim();

         await updateDoc(doc(db, 'challenges', item.id), { solution });
         processed++;
         console.log(`Updated ${item.id} - ${item.title}`);
      } catch (err: any) {
         if (err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429) {
             console.log("Quota exceeded, backing off 60s...");
             await new Promise(r => setTimeout(r, 60000));
         } else if (err?.status === 503 || err?.message?.includes("experiencing high demand")) {
             console.log("High demand, back off 15s...");
             await new Promise(r => setTimeout(r, 15000));
         } else {
             console.error(`Failed to process ${item.id}:`, err?.message || err);
         }
      }
      await new Promise(r => setTimeout(r, 2000));
  }
  process.exit(0);
}
run();
