const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');

const invert = `
/* Light mode overrides */
html:not(.dark) .bg-white\\/5 { background-color: rgba(0,0,0,0.03) !important; }
html:not(.dark) .bg-white\\/10 { background-color: rgba(0,0,0,0.06) !important; }
html:not(.dark) .bg-white\\/20 { background-color: rgba(0,0,0,0.12) !important; }

html:not(.dark) .text-white { color: rgba(15,23,42,1) !important; }
html:not(.dark) .text-white\\/90 { color: rgba(15,23,42,0.9) !important; }
html:not(.dark) .text-white\\/80 { color: rgba(15,23,42,0.8) !important; }
html:not(.dark) .text-white\\/70 { color: rgba(15,23,42,0.7) !important; }
html:not(.dark) .text-white\\/60 { color: rgba(15,23,42,0.6) !important; }
html:not(.dark) .text-white\\/50 { color: rgba(15,23,42,0.5) !important; }
html:not(.dark) .text-white\\/40 { color: rgba(15,23,42,0.4) !important; }
html:not(.dark) .text-white\\/30 { color: rgba(15,23,42,0.3) !important; }

html:not(.dark) .border-white\\/5 { border-color: rgba(0,0,0,0.05) !important; }
html:not(.dark) .border-white\\/10 { border-color: rgba(0,0,0,0.1) !important; }
html:not(.dark) .border-white\\/20 { border-color: rgba(0,0,0,0.2) !important; }

/* Match glass card styles to light mode */
html:not(.dark) .bg-\\[\\#15151e\\] { background-color: rgba(0,0,0,0.03) !important; }
html:not(.dark) .bg-\\[\\#1a1a2e\\] { background-color: rgba(0,0,0,0.05) !important; }

`;

c = c.replace('/* Custom scrollbar', invert + '/* Custom scrollbar');
fs.writeFileSync('src/index.css', c);
console.log('Done overrides');
