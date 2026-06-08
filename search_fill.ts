import fetch from "node-fetch";
import fs from "fs";

const data = JSON.parse(fs.readFileSync("src/lessonsData.ts", "utf8").split("export const lessonsData = ")[1].split(";\n")[0]);
console.log(data.filter((d: any) => JSON.stringify(d).toLowerCase().includes("auto-fill")).map((d: any) => d.title));
