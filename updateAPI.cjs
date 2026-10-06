const fs = require('fs');
let c = fs.readFileSync('src/components/SoundCloudDynamicIsland.jsx', 'utf8');

c = c.replace(/const CLIENT_ID = 'YOUR_SOUNDCLOUD_CLIENT_ID';[^\n]*\n/, '');

const oldFetchBlock = /const response = await fetch\(`https:\/\/api\.soundcloud\.com\/tracks\?q=\$\{encodeURIComponent\(searchQuery\)\}&client_id=\$\{CLIENT_ID\}&limit=5`\);\s*if \(response\.ok\) \{\s*const data = await response\.json\(\);\s*setSearchResults\(data\.map\(track => \(\{\s*id: track\.id,\s*title: track\.title,\s*artist: track\.user\?\.username \|\| 'SC Artist',\s*stream_url: track\.stream_url \? `\$\{track\.stream_url\}\?client_id=\$\{CLIENT_ID\}` : "",\s*artwork_url: track\.artwork_url \|\| "https:\/\/images\.unsplash\.com\/photo-1611339555312-e607c8352fd7\?w=80&q=80"\s*\}\)\)\);/m;

const newFetchBlock = `const response = await fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(searchQuery)}&media=music&entity=song&limit=10\`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results.map(track => ({
            id: track.trackId,
            title: track.trackName,
            artist: track.artistName,
            stream_url: track.previewUrl,
            artwork_url: track.artworkUrl100
          })));`;

c = c.replace(oldFetchBlock, newFetchBlock);
fs.writeFileSync('src/components/SoundCloudDynamicIsland.jsx', c);
