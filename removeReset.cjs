const fs = require('fs');
let c = fs.readFileSync('src/pages/SetupPage.jsx', 'utf8');

c = c.replace(/\s*\{\/\* .*? Reset Session Data \(Testing\) .*? \*\/\}\s*<motion\.div[\s\S]*?<\/motion\.div>/, '');

fs.writeFileSync('src/pages/SetupPage.jsx', c);
