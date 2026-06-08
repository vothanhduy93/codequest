import fs from "fs";

const all = JSON.parse(fs.readFileSync("all_challenges.json", "utf8"));
console.log(all.filter((d: any) => JSON.stringify(d).toLowerCase().includes("60px")).map((d: any) => ({id: d.id, title: d.title})));

const ldata = fs.readFileSync("src/lessonsData.ts", "utf8");
console.log("60px in lessonsData.ts?", ldata.includes("60px"));
