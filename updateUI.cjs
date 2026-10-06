const fs = require('fs');
let c = fs.readFileSync('src/components/SoundCloudDynamicIsland.jsx', 'utf8');

c = c.replace(/height: isSearching \? 380 : 54,/, 'height: isSearching ? 380 : 64,');

c = c.replace(/className="flex items-center justify-between h-full px-4 text-white"/, 'className="flex flex-col justify-center h-full px-4 text-white relative"');

c = c.replace(/\{\/\* Cover Art \/ Waveform animation \*\/\}/, '<div className="flex items-center justify-between w-full">{/* Cover Art / Waveform animation */}');

const newProgressBar = `</button>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="flex items-center gap-2 w-full mt-1.5 px-0.5">
              <span className="text-[9px] text-zinc-400 font-medium w-6 text-right">{currentTime}</span>
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-300 ease-linear" style={{ width: \`\${progress}%\` }} />
              </div>
              <span className="text-[9px] text-zinc-400 font-medium w-6">{duration}</span>
            </div>
          </motion.div>`;

c = c.replace(/<\/button>\s*<\/div>\s*<\/motion\.div>/, newProgressBar);

fs.writeFileSync('src/components/SoundCloudDynamicIsland.jsx', c);
