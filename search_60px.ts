import fs from "fs";

const all = JSON.parse(fs.readFileSync("all_challenges.json", "utf8"));
console.log(all.filter((d: any) => JSON.stringify(d).includes("60px")).map((d: any) => ({id: d.id, title: d.title})));

const ldata = fs.readFileSync("src/lessonsData.ts", "utf8");
let i = 0;
const results = [];
for (const line of ldata.split('\n')) {
    if (line.includes('60px') || line.includes('1fr')) {
        results.push(line);
    }
}
console.log("lessonsData.ts matches limited:", results.slice(0, 10));
