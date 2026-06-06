import * as dotenv from 'dotenv';
dotenv.config();
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const fc = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(fc);
const db = getFirestore(app, fc.firestoreDatabaseId);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  console.log('Starting to autofix failed solutions...');
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  const toFix: any[] = [];
  querySnapshot.forEach(d => {
      const data = d.data();
      if (data.auditStatus === 'FAIL' || data.auditStatus === 'ERROR') {
          toFix.push({ id: d.id, ...data });
      }
  });
  console.log(`Found ${toFix.length} failed solutions to fix.`);

  let processed = 0;
  for (const item of toFix) {
      let success = false;
      let attempt = 0;
      while (!success && attempt < 3) {
         try {
            const prompt = `You are an expert coding assistant correcting a failed programming challenge solution.\n\nChallenge Title: ${item.title}\nInstructions: ${item.instructions}\nDescription: ${item.description}\nDefault Code:\n\`\`\`\n${item.defaultCode}\n\`\`\`\n\nHere is the solution that FAILED the audit:\n\`\`\`\n${item.solution}\n\`\`\`\n\nAudit Feedback (Why it failed):\n${item.auditFeedback}\n\nProvide ONLY the final corrected raw HTML/CSS/JS code. No explanations. No markdown codeblocks (e.g. no \`\`\`html or \`\`\`). Just the pure, solved HTML/CSS/JS code.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-flash-lite-latest',
                contents: prompt,
            });

            let solution = response.text || '';
            solution = solution.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();

            await updateDoc(doc(db, 'challenges', item.id), { 
                solution,
                auditStatus: 'PENDING',
                auditFeedback: 'Autofixed, pending re-audit'
            });
            processed++;
            console.log(`[${processed}/${toFix.length}] Autofixed ${item.id} - ${item.title}`);
            success = true;
         } catch (err: any) {
            console.error(`Failed to autofix ${item.id}:`, err?.message?.substring(0, 50));
            // if hitting rate limits, sleep 10 seconds
            await new Promise(r => setTimeout(r, 10000));
            attempt++;
         }
      }
      
      // wait 4s to stay within 15 RPM limits (60s / 15 = 4s)
      await new Promise(r => setTimeout(r, 4200));
  }
  console.log('Autofix job finished.');
  process.exit(0);
}
run();
