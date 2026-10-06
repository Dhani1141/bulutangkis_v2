const fs = require('fs');
let c = fs.readFileSync('src/components/SoundCloudDynamicIsland.jsx', 'utf8');

c = c.replace(/const audioRef = useRef\(new Audio\(\)\); \/\/ Playback engine/, `const audioRef = useRef(new Audio()); // Playback engine
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:30');

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => {
      const current = audio.currentTime;
      const total = audio.duration || 30;
      setProgress((current / total) * 100);
      const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
      };
      setCurrentTime(formatTime(current));
      setDuration(formatTime(total));
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime('0:00');
    };
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);`);

fs.writeFileSync('src/components/SoundCloudDynamicIsland.jsx', c);
