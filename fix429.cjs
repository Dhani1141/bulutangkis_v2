const fs = require('fs');
let c = fs.readFileSync('src/lib/aiHelpers.js', 'utf8');

c = c.replace(/if \(err\.message\.includes\('503'\)\) \{\s*return 'Komentator sedang sibuk \(Server Google penuh\/503\)\. Silakan coba lagi nanti\.';\s*\}/, `if (err.message.includes('503')) {
         return 'Komentator sedang sibuk (Server Google penuh/503). Silakan coba lagi nanti.';
      }
      if (err.message.includes('429')) {
         return 'Waduh, komentatornya lagi ngopi bentar (Limit API habis/429). Tunggu beberapa saat lalu refresh ya!';
      }`);

fs.writeFileSync('src/lib/aiHelpers.js', c);
