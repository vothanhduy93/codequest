import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function run() {
  if (!process.env.GEMINI_API_KEY) {
      console.error("No GEMINI_API_KEY set. Loading from .env...");
      require('dotenv').config();
  }
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
      let success = false;
      let retries = 3;
      while (!success && retries > 0) {
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
                 model: 'gemini-1.5-flash',
                 contents: prompt,
             });

             let solution = response.text || '';
             solution = solution.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '').trim();

             await updateDoc(doc(db, 'challenges', item.id), { solution });
             success = true;
             processed++;
             console.log(`[${processed}/${missing.length}] Updated ${item.id} - ${item.title}`);
          } catch (err: any) {
             console.error(`Failed to process ${item.id}:`, err?.message || err);
             retries--;
             if (retries > 0) {
                 console.log(`Retrying in 5s...`);
                 await delay(5000);
             }
          }
      }
      if (!success) {
          console.error(`Skipping ${item.id} after 3 fails.`);
      }
      
      // wait 3 seconds between requests to avoid quota
      await delay(3000);
  }
  
  console.log('Done filling missing solutions.');
  process.exit(0);
}
run();
