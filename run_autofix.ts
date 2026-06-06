import * as dotenv from 'dotenv';
dotenv.config();

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  console.log('[API] Starting to autofix failed solutions via script...');
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  const toFix: any[] = [];
  querySnapshot.forEach(d => {
      const data = d.data();
      if (data.auditStatus === 'FAIL' || data.auditStatus === 'ERROR') {
          toFix.push({ id: d.id, ...data });
      }
  });
  console.log(`[API] Found ${toFix.length} failed solutions to fix.`);

  let processed = 0;
  for (const item of toFix) {
      try {
         const prompt = `You are an expert coding assistant correcting a failed programming challenge solution.

Challenge Title: ${item.title}
Instructions: ${item.instructions}
Description: ${item.description}
Default Code:
\`\`\`
${item.defaultCode}
\`\`\`

Here is the solution that FAILED the audit:
\`\`\`
${item.solution}
\`\`\`

Audit Feedback (Why it failed):
${item.auditFeedback}

Provide ONLY the final corrected raw HTML/CSS/JS code. No explanations. No markdown codeblocks (e.g. no \`\`\`html or \`\`\`). Just the pure, solved HTML/CSS/JS code.`;

         const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash-lite',
             contents: prompt,
         });

         let solution = response.text || '';
         solution = solution.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '').trim();

         await updateDoc(doc(db, 'challenges', item.id), { 
             solution,
             auditStatus: 'PENDING',
             auditFeedback: 'Autofixed, pending re-audit'
         });
         processed++;
         console.log(`[API] [${processed}/${toFix.length}] Autofixed ${item.id} - ${item.title}`);
      } catch (err: any) {
         console.error(`[API] Failed to autofix ${item.id}:`, err?.message || err);
         if (err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429) {
             toFix.push(item); // Retry later
             await new Promise(r => setTimeout(r, 65000));
         } else if (err?.status === 503 || err?.message?.includes("demand")) {
             toFix.push(item);
             await new Promise(r => setTimeout(r, 15000));
         }
      }
      // wait less to speed up
      await new Promise(r => setTimeout(r, 1500));
  }
  console.log('[API] Background autofix job finished.');
  process.exit(0);
}

run();
