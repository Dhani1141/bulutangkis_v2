const fs = require('fs');
let c = fs.readFileSync('src/pages/History.jsx', 'utf8');

c = c.replace(/import \{ getSessionsFromFirestore \} from '\.\.\/lib\/firebaseHelpers';/, `import { getSessionsFromFirestore, deleteSingleSession } from '../lib/firebaseHelpers';\nimport { Trash2 } from 'lucide-react';`);

c = c.replace(/<div \n            key=\{session\.dateId\} \n            className="flex items-center justify-center bg-white\/\[0\.02\] border border-white\/5 hover:border-indigo-500\/30 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 relative group"\n          >/, `<div 
            key={session.dateId} 
            className="flex items-center justify-center bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 relative group"
          >
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm('Yakin mau hapus sesi tanggal ' + session.date + '?')) {
                  setIsLoading(true);
                  await deleteSingleSession(session.dateId);
                  const sessionData = await getSessionsFromFirestore();
                  setSessions(sessionData);
                  setIsLoading(false);
                }
              }}
              className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Hapus Sesi"
            >
              <Trash2 size={18} />
            </button>`);

fs.writeFileSync('src/pages/History.jsx', c);
