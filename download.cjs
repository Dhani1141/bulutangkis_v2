const fs = require('fs');
const https = require('https');

const files = ['FolderFloat.jsx', 'FolderFloat.css'];

files.forEach(file => {
  https.get(`https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/content/Micro/FolderFloat/${file}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync(`src/components/${file}`, data);
      console.log(`Downloaded ${file}`);
    });
  }).on('error', err => console.error(err));
});
