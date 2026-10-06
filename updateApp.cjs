const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(/import ThemeToggle from '\.\/components\/ThemeToggle'/, "import ThemeToggle from './components/ThemeToggle'\nimport SoundCloudDynamicIsland from './components/SoundCloudDynamicIsland'");

c = c.replace(/<div className="absolute top-4 right-4 z-50">\s*<ThemeToggle \/>\s*<\/div>/, `<div className="absolute top-4 right-4 z-50 flex items-start gap-4">\n          <SoundCloudDynamicIsland />\n          <ThemeToggle />\n        </div>`);

fs.writeFileSync('src/App.jsx', c);
