const fs = require('fs');

let c = fs.readFileSync('src/components/FieldPanel.jsx', 'utf8');

c = c.replace(/const \[scoreA, setScoreA\] = useState\(''\)/g, 'const [scoreA, setScoreA] = useState(0)');
c = c.replace(/const \[scoreB, setScoreB\] = useState\(''\)/g, 'const [scoreB, setScoreB] = useState(0)');
c = c.replace(/setScoreA\(''\)/g, 'setScoreA(0)');
c = c.replace(/setScoreB\(''\)/g, 'setScoreB(0)');

c = c.replace(/scoreA === '' \|\| scoreB === ''/g, 'scoreA === undefined || scoreB === undefined');

const wakeA = `<WakeSlider
                          value={scoreA}
                          min={0}
                          max={30}
                          step={1}
                          bars={30}
                          height={56}
                          restHeight={12}
                          gap={4}
                          fillColor="#4f46e5"
                          trackColor="rgba(255, 255, 255, 0.05)"
                          sensitivity={1}
                          reach={6}
                          skew={0.6}
                          glide={0.3}
                          smoothing={100}
                          showValue={true}
                          onChange={(val) => setScoreA(val)}
                        />`;

const wakeB = wakeA.replace(/scoreA/g, 'scoreB').replace(/setScoreA/g, 'setScoreB');

c = c.replace(/<input[\s\S]*?onChange=\{\(e\) => setScoreA\(e\.target\.value\)\}[\s\S]*?\/>/, wakeA);
c = c.replace(/<input[\s\S]*?onChange=\{\(e\) => setScoreB\(e\.target\.value\)\}[\s\S]*?\/>/, wakeB);

c = c.replace(/const numA = parseInt\(scoreA, 10\)/, 'const numA = Number(scoreA)');
c = c.replace(/const numB = parseInt\(scoreB, 10\)/, 'const numB = Number(scoreB)');

const validationStart = c.indexOf('// \ud83c\udfaf Score validation \ud83c\udfaf');
const validationEnd = c.indexOf('const isTied =', validationStart);
const tiedEnd = c.indexOf('10)', validationEnd) + 3;

if (validationStart !== -1 && tiedEnd > validationStart) {
  const newValidation = `// Score validation
  const scoresValid = !(scoreA === 0 && scoreB === 0) && scoreA !== scoreB && scoreA >= 0 && scoreB >= 0;
  const isTied = scoreA === scoreB;`;
  c = c.substring(0, validationStart) + newValidation + c.substring(tiedEnd);
}

fs.writeFileSync('src/components/FieldPanel.jsx', c);
console.log('done');
