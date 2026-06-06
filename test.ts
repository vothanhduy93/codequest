import * as dotenv from 'dotenv'; dotenv.config();
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({});
ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: 'Perform an audit on this solution: "console.log(1)". Challenge: "Log 1".',
    config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: "OBJECT",
            properties: {
                status: { type: "STRING" },
                feedback: { type: "STRING" }
            }
        }
    }
}).then(r=>console.log(r.text)).catch(e=>console.error(JSON.stringify(e)));
