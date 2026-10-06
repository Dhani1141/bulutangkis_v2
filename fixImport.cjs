const fs = require('fs');
let c = fs.readFileSync('src/components/SoundCloudDynamicIsland.jsx', 'utf8');

c = c.replace(/import ReactPlayer from 'react-player\/youtube';/, "import ReactPlayer from 'react-player';");

fs.writeFileSync('src/components/SoundCloudDynamicIsland.jsx', c);
