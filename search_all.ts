import fs from "fs";

const ldata = fs.readFileSync("src/lessonsData.ts", "utf8");
let i = 0;
const results = [];
for (const line of ldata.split('\n')) {
    if (line.toLowerCase().includes('bố cục linh hoạt') || line.toLowerCase().includes('tạo bố cục')) {
        results.push(line);
    }
}
console.log("lessonsData.ts matches:", results);
