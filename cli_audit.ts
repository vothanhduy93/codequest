import * as dotenv from 'dotenv';
dotenv.config();
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  const toAudit: any[] = [];
  querySnapshot.forEach(d => {
      const data = d.data();
      // Only audit if there's a solution and it hasn't been audited yet
      // You can change `!data.auditStatus` if you want to re-audit failed ones, etc.
      if (data.solution && (!data.auditStatus || data.auditStatus === 'PENDING')) {
          toAudit.push({ id: d.id, ...data });
      }
  });

  console.log(`Found ${toAudit.length} solutions to audit.`);

  let processed = 0;
  for (const item of toAudit) {
      if (processed >= 200) break; // Arbitrary safety limit per run
      let attempt = 0;
      let success = false;

      while (attempt < 3 && !success) {
          try {
             const prompt = `You are an expert coding auditor. I will provide you with a programming challenge and its proposed solution.
Your task is to determine if the solution accurately and effectively fulfills all the challenge instructions.

Challenge Title: ${item.title}
Instructions: ${item.instructions}
Description: ${item.description}
Default Code:
\`\`\`
${item.defaultCode}
\`\`\`

Proposed Solution:
\`\`\`
${item.solution}
\`\`\`

Evaluate the solution. Check if there are any syntax errors, if it produces the expected outcome, and if it adheres to all instructions.`;

             const response = await ai.models.generateContent({
                 model: 'gemini-flash-latest',
                 contents: prompt,
                 config: {
                     responseMimeType: 'application/json',
                     responseSchema: {
                         type: Type.OBJECT,
                         properties: {
                             status: {
                                 type: Type.STRING,
                                 description: "Either 'PASS' if the solution is completely correct, or 'FAIL' if it is incorrect or missing requirements.",
                                 enum: ["PASS", "FAIL"]
                             },
                             feedback: {
                                 type: Type.STRING,
                                 description: "A short review explaining why it passed or failed. If it failed, point out exactly what is wrong."
                             }
                         },
                         required: ["status", "feedback"]
                     }
                 }
             });

             const auditResult = JSON.parse(response.text || '{}');
             
             await updateDoc(doc(db, 'challenges', item.id), { 
                 auditStatus: auditResult.status || 'ERROR',
                 auditFeedback: auditResult.feedback || 'Failed to parse audit result.'
             });

             processed++;
             console.log(`Audited ${item.id} - ${item.title} -> ${auditResult.status}`);
             success = true;
          } catch (err: any) {
             if (err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429) {
                 console.log("Quota exceeded, backing off 60s...");
                 await new Promise(r => setTimeout(r, 60000));
             } else if (err?.status === 503 || err?.message?.includes("experiencing high demand")) {
                 console.log("High demand, back off 15s...");
                 await new Promise(r => setTimeout(r, 15000));
             } else {
                 console.error(`Failed to process ${item.id}:`, err?.message || err);
                 attempt++;
                 break;
             }
             attempt++;
          }
      }
      
      // Delay to avoid hitting rate limit of 15 Requests Per Minute (RPM)
      // 15 requests per 60 seconds = 1 request every 4 seconds. Let's use 4.5s safe margin.
      await new Promise(r => setTimeout(r, 4500));
  }
  
  console.log("Audit job completed.");
  process.exit(0);
}

run();
