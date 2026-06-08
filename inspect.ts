import fs from "fs";

const all = JSON.parse(fs.readFileSync("all_challenges.json", "utf8"));
console.log("Type of all:", Array.isArray(all) ? "Array" : typeof all);
if (Array.isArray(all)) {
    console.log("Length:", all.length);
    console.log("First item keys:", Object.keys(all[0]));
    console.log("Stringified includes 60px?:", JSON.stringify(all).includes("60px"));
    const match = all.find(x => JSON.stringify(x).includes("60px"));
    if(match) console.log(match.id, match.title);
} else {
    console.log("It's an object. Keys:", Object.keys(all));
}
