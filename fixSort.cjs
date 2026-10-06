const fs = require('fs');
let c = fs.readFileSync('src/lib/firebaseHelpers.js', 'utf8');

const regex = /let topPlayers = \[\][\s\S]*?const dateStr = /;

const replacement = `let topPlayers = []
        if (data.playerStats) {
          topPlayers = Object.entries(data.playerStats).sort((a, b) => {
            const winRateA = a[1].total_matches > 0 ? (a[1].total_wins / a[1].total_matches) * 100 : 0;
            const winRateB = b[1].total_matches > 0 ? (b[1].total_wins / b[1].total_matches) * 100 : 0;
            if (winRateB !== winRateA) return winRateB - winRateA;
            if (b[1].total_wins !== a[1].total_wins) return b[1].total_wins - a[1].total_wins;
            return b[1].total_matches - a[1].total_matches;
          }).slice(0, 5).map((entry, index) => \`\${index === 0 && entry[1].total_wins > 0 ? '🏆 ' : ''}\${entry[0]}\`)
        }
        
        const dateStr = `;

c = c.replace(regex, replacement);
fs.writeFileSync('src/lib/firebaseHelpers.js', c);
