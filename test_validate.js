import { jsdom } from 'jsdom';

const html = `
<!DOCTYPE html>
<html lang="en" translate="no">
<head>
    <script>
    function __validate() {
        try {
            const code = "<script>\\n// Hello\\n/* World */\\n</script>";
            const jsMatch = code.match(/<script(.*?)?>\\n?([\\s\\S]*?)\\n?<\\/script>/i); 
            const jsCode = jsMatch ? jsMatch[2] : ''; 
            return /\\/\\/.*/.test(jsCode) && /\\/\\*[\\s\\S]*?\\*\\//.test(jsCode);
        } catch(e) {
            return false;
        }
    }
    </script>
</head>
<body>
</body>
</html>
`;
const JSDOM = require("jsdom").JSDOM;
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
console.log("Result:", window.__validate());
