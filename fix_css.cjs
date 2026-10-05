const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');

c = c.split("/* \ud83c\udfaf Number input")[0];

const append = `/* 🎯 Number input spinner removal 🎯 */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.6s;
}
::view-transition-new(root) {
  animation-name: revealRightToLeft;
  clip-path: circle(0% at calc(100% - 2.5rem) 2.5rem);
}
@keyframes revealRightToLeft {
  to {
    clip-path: circle(150% at calc(100% - 2.5rem) 2.5rem);
  }
}
`;

fs.writeFileSync('src/index.css', c + append);
console.log('Done');
