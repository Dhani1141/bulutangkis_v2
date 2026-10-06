const fs = require('fs');
let c = fs.readFileSync('src/components/SoundCloudDynamicIsland.jsx', 'utf8');

c = c.replace(/import \{ Play01Icon, Pause01Icon, Search01Icon, ArrowLeft02Icon, MusicNote01Icon, Forward01Icon, Backward01Icon \} from '@hugeicons\/react';.*/, "import { Play, Pause, Search, ArrowLeft, Music, SkipForward, SkipBack } from 'lucide-react';");
c = c.replace(/<Play01Icon.*?\/>/g, '<Play size={14} fill="currentColor" />');
c = c.replace(/<Pause01Icon.*?\/>/g, '<Pause size={14} fill="currentColor" />');
c = c.replace(/<Search01Icon/g, '<Search');
c = c.replace(/<ArrowLeft02Icon/g, '<ArrowLeft');
c = c.replace(/<MusicNote01Icon/g, '<Music');
c = c.replace(/<Forward01Icon/g, '<SkipForward');
c = c.replace(/<Backward01Icon/g, '<SkipBack');

fs.writeFileSync('src/components/SoundCloudDynamicIsland.jsx', c);
