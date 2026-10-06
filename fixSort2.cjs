const fs = require('fs');
let c = fs.readFileSync('src/lib/firebaseHelpers.js', 'utf8');

const regex = /topPlayers = Object\.entries\(data\.playerStats\)\.sort\(\(a, b\) => \{[\s\S]*?\}\)/;

const replacement = `topPlayers = Object.entries(data.playerStats).sort((a, b) => {
            const winRateA = a[1].total_matches > 0 ? (a[1].total_wins / a[1].total_matches) * 100 : 0;
            const winRateB = b[1].total_matches > 0 ? (b[1].total_wins / b[1].total_matches) * 100 : 0;
            if (winRateB !== winRateA) return winRateB - winRateA;
            if (b[1].total_wins !== a[1].total_wins) return b[1].total_wins - a[1].total_wins;
            return a[0].localeCompare(b[0]);
          })`;

c = c.replace(regex, replacement);
fs.writeFileSync('src/lib/firebaseHelpers.js', c);
