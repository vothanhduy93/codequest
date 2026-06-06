import * as dotenv from 'dotenv';
dotenv.config();
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import * as fs2 from 'fs';
const firebaseConfig = JSON.parse(fs2.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  console.log('Starting to autofix failed solutions...');
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  const toFix = [];
  querySnapshot.forEach(d => {
      const data = d.data();
      if (data.auditStatus === 'FAIL' || data.auditStatus === 'ERROR') {
          toFix.push({ id: d.id, ...data });
      }
  });
  console.log('Found ' + toFix.length + ' failed solutions to fix.');
  const models = ['gemini-flash-lite-latest', 'gemini-2.5-flash-lite', 'gemini-pro-latest'];
  let mIndex = 0;
  let processed = 0;
  for (const item of toFix) {
      let attempt = 0;
      let success = false;
      while (attempt < 4 && !success) {
         try {
            const prompt = 'You are an expert coding assistant correcting a failed programming challenge solution.

Challenge Title: ' + item.title + '
Instructions: ' + item.instructions + '
Description: ' + item.description + '
Default Code:


Here is the solution that FAILED the audit:


Audit Feedback (Why it failed):
' + item.auditFeedback + '

Provide ONLY the final corrected raw HTML/CSS/JS code. No explanations. No markdown codeblocks (e.g. no ). Just the pure, solved HTML/CSS/JS code.';
            const m = models[mIndex % models.length];
            mIndex++;
            const response = await ai.models.generateContent({
                model: m,
                contents: prompt,
            });
            let solution = response.text || '';
            solution = solution.replace(/^$/, '').trim();
            await updateDoc(doc(db, 'challenges', item.id), { 
                solution,
                auditStatus: 'PENDING',
                auditFeedback: 'Autofixed, pending re-audit'
            });
            processed++;
            console.log('[' + processed + '/' + toFix.length + '] Autofixed ' + item.id + ' using ' + m);
            success = true;
         } catch (err) {
            console.error('Failed to autofix ' + item.id + ':', err?.message?.substring(0, 50));
            mIndex++;
            await new Promise(r => setTimeout(r, 65000));
            attempt++;
         }
      }
      if (!success) {
         console.error('Completely failed to autofix ' + item.id);
      }
      await new Promise(r => setTimeout(r, 3000));
  }
  console.log('Autofix job finished.');
  process.exit(0);
}
run();