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
      if (data.solution && (!data.auditStatus || data.auditStatus === 'PENDING')) {
          toAudit.push({ id: d.id, ...data });
      }
  });

  console.log(`Found ${toAudit.length} solutions to audit.`);

  if (toAudit.length > 0) {
      const item = toAudit[0];
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
                 model: 'gemini-2.5-flash',
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

             console.log("Raw Response:", response.text);
             const auditResult = JSON.parse(response.text || '{}');
             console.log("Parsed Result:", auditResult);
             
             await updateDoc(doc(db, 'challenges', item.id), { 
                 auditStatus: auditResult.status || 'ERROR',
                 auditFeedback: auditResult.feedback || 'Failed to parse audit result.'
             });
             console.log(`Audited ${item.id} - ${item.title} -> ${auditResult.status}`);
      } catch (err: any) {
             console.error(`Failed to process ${item.id}:`, err?.message || err);
      }
  }
  process.exit(0);
}

run();
