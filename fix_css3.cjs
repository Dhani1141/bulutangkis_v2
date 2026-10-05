const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');

const invert2 = `
/* WakeSlider and JellyRadio light mode fixes */
html:not(.dark) .wake-slider {
  --ws-track: rgba(0,0,0,0.08) !important;
}
html:not(.dark) .wake-slider__value {
  color: #334155 !important;
}

html:not(.dark) [style*="--jr-chip"] {
  --jr-chip: rgba(0,0,0,0.08) !important;
  --jr-text: #475569 !important;
}
`;

c = c.replace('/* Custom scrollbar', invert2 + '/* Custom scrollbar');
fs.writeFileSync('src/index.css', c);
console.log('Done component overrides');
