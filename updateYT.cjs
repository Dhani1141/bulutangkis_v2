const fs = require('fs');
let c = fs.readFileSync('src/components/SoundCloudDynamicIsland.jsx', 'utf8');

// 1. Add ReactPlayer import
if (!c.includes('ReactPlayer')) {
  c = c.replace(/import \{ Play, Pause/, "import ReactPlayer from 'react-player/youtube';\nimport { Play, Pause");
}

// 2. Remove audioRef and old useEffect listener
c = c.replace(/const audioRef = useRef\(new Audio\(\)\); \/\/ Playback engine\s*const \[progress, setProgress\] = useState\(0\);\s*const \[currentTime, setCurrentTime\] = useState\('0:00'\);\s*const \[duration, setDuration\] = useState\('0:30'\);\s*useEffect\(\(\) => \{\s*const audio = audioRef\.current;[\s\S]*?audio\.removeEventListener\('ended', handleEnded\);\s*\};\s*\}, \[\]\);/, `const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  const handleProgress = (state) => {
    setProgress(state.played * 100);
    setCurrentTime(formatTime(state.playedSeconds));
  };

  const handleDuration = (dur) => {
    setDuration(formatTime(dur));
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime('0:00');
  };`);

// 3. Update fetch logic
const API_KEY = "AIzaSyBKgo6xvjnq_z5vdvkF3UgXE4CI6I-hpHM";
const oldFetch = /const response = await fetch\(`https:\/\/itunes\.apple\.com\/search\?term=\$\{encodeURIComponent\(searchQuery\)\}&media=music&entity=song&limit=10`\);\s*if \(response\.ok\) \{\s*const data = await response\.json\(\);\s*setSearchResults\(\(data\.results \|\| \[\]\)\.map\(track => \(\{\s*id: track\.trackId,\s*title: track\.trackName,\s*artist: track\.artistName,\s*stream_url: track\.previewUrl,\s*artwork_url: track\.artworkUrl100 \|\| "https:\/\/images\.unsplash\.com\/photo-1611339555312-e607c8352fd7\?w=80&q=80"\s*\}\)\)\);/;

const newFetch = `const response = await fetch(\`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=\${encodeURIComponent(searchQuery)}&type=video&key=${API_KEY}\`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults((data.items || []).map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            stream_url: \`https://www.youtube.com/watch?v=\${item.id.videoId}\`,
            artwork_url: item.snippet.thumbnails.default?.url || "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=80&q=80"
          })));`;
          
c = c.replace(oldFetch, newFetch);

// 4. Update togglePlay logic
const oldTogglePlay = /const togglePlay = \(\) => \{[\s\S]*?setIsPlaying\(!isPlaying\);\s*\};/;
const newTogglePlay = `const togglePlay = () => setIsPlaying(!isPlaying);`;
c = c.replace(oldTogglePlay, newTogglePlay);

// 5. Update handleSelectTrack logic
const oldSelectTrack = /const handleSelectTrack = \(track\) => \{[\s\S]*?setIsPlaying\(true\);\s*\};/;
const newSelectTrack = `const handleSelectTrack = (track) => {
    setCurrentTrack(track);
    setIsSearching(false);
    setSearchQuery('');
    setIsPlaying(true);
  };`;
c = c.replace(oldSelectTrack, newSelectTrack);

// 6. Inject ReactPlayer in JSX
if (!c.includes('<ReactPlayer')) {
  c = c.replace(/<div className="relative">/, `<div className="relative">
      <ReactPlayer 
        url={currentTrack.stream_url} 
        playing={isPlaying} 
        onProgress={handleProgress} 
        onDuration={handleDuration} 
        onEnded={handleEnded} 
        width="0" 
        height="0" 
        style={{ display: 'none' }} 
      />`);
}

// 7. Update SoundCloud text to YouTube
c = c.replace(/<span className="text-\[10px\] text-zinc-400 truncate">SoundCloud<\/span>/g, '<span className="text-[10px] text-zinc-400 truncate">YouTube</span>');
c = c.replace(/Cari lagu di SoundCloud\.\.\./g, 'Cari lagu di YouTube...');
c = c.replace(/Mencari di SoundCloud\.\.\./g, 'Mencari di YouTube...');

fs.writeFileSync('src/components/SoundCloudDynamicIsland.jsx', c);
