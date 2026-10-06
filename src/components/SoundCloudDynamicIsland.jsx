import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { Play, Pause, Search, ArrowLeft, Music, SkipForward, SkipBack } from 'lucide-react';

const SoundCloudDynamicIsland = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Player state
  const [currentTrack, setCurrentTrack] = useState({
    title: "Badminton Warm Up (Preview)",
    artist: "Sports Beat",
    stream_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/95/9b/64/959b646c-c760-4927-4a0b-93ff5f9ec0fc/mzaf_645555418181639014.plus.aac.p.m4a", 
    id: 1,
    artwork_url: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=80&q=80"
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  // Fetch search results from iTunes
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=music&entity=song&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results.map(track => ({
            id: track.trackId,
            title: track.trackName,
            artist: track.artistName,
            stream_url: track.previewUrl,
            artwork_url: track.artworkUrl100
          })));
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Player controls
  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSelectTrack = (track) => {
    setCurrentTrack(track);
    setIsSearching(false);
    setSearchQuery('');
    setIsPlaying(true);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
  };

  return (
    <div className="relative">
      {/* Hidden ReactPlayer for iTunes Audio */}
      <ReactPlayer 
        url={currentTrack.stream_url} 
        playing={isPlaying} 
        controls={false}
        width="0"
        height="0"
        style={{ display: 'none' }}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={handleEnded}
        onError={(e) => {
          console.error("Player Error:", e);
          setIsPlaying(false);
        }}
      />

      <AnimatePresence mode="wait">
        {!isSearching ? (
          /* STATE 1: PLAYER MODE (Pil Mungil) */
          <motion.div
            key="player"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex flex-col gap-2 bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-2xl w-[320px] mx-auto overflow-hidden"
          >
            <div className="flex items-center justify-between w-full">
              {/* Cover Art & Title */}
              <div className="flex items-center gap-3 max-w-[150px]">
                <img 
                  src={currentTrack.artwork_url} 
                  alt="Track cover" 
                  className={`w-10 h-10 rounded-full border border-white/20 object-cover shadow-sm ${isPlaying ? 'animate-spin [animation-duration:8s]' : ''}`}
                />
                <div className="flex flex-col truncate">
                  <span className="text-sm font-bold text-white truncate">{currentTrack.title}</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                    <Music size={10} />
                    <span className="truncate">{currentTrack.artist}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                <button className="text-zinc-400 hover:text-white transition active:scale-90"><SkipBack size={16} /></button>
                <button onClick={togglePlay} className="p-2 bg-white text-zinc-950 rounded-full shadow-md hover:scale-105 transition active:scale-95">
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </button>
                <button className="text-zinc-400 hover:text-white transition active:scale-90"><SkipForward size={16} /></button>
                
                {/* Switch to Search */}
                <button 
                  onClick={() => setIsSearching(true)}
                  className="ml-1 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition active:scale-90"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

            {/* Time & Progress Bar */}
            <div className="flex items-center gap-2 px-1 pb-1">
              <span className="text-[9px] font-medium text-zinc-400 w-6 text-right">{currentTime}</span>
              <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[9px] font-medium text-zinc-400 w-6">{duration}</span>
            </div>
          </motion.div>
        ) : (
          /* STATE 2: SEARCH MODE (Mekar Kebawah) */
          <motion.div
            key="search"
            initial={{ opacity: 0, height: 40, borderRadius: 9999 }}
            animate={{ opacity: 1, height: 'auto', borderRadius: 24 }}
            exit={{ opacity: 0, height: 40, borderRadius: 9999 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-2xl w-[320px] mx-auto overflow-hidden"
          >
            {/* Search Input Area */}
            <div className="flex items-center gap-3 p-3 border-b border-white/5">
              <button 
                onClick={() => setIsSearching(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition active:scale-90"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="flex-1 flex items-center gap-2 bg-black/40 rounded-full px-3 py-1.5 border border-white/5 focus-within:border-emerald-500/50 transition-colors">
                <Search size={14} className="text-zinc-400" />
                <input 
                  type="text"
                  autoFocus
                  placeholder="Cari lagu di iTunes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center p-4 text-sm text-zinc-400 gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  Mencari...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(track => (
                  <motion.button
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.08)" }}
                    className="w-full flex items-center gap-3 p-2 rounded-xl text-left bg-white/[0.02] border border-white/5 transition"
                  >
                    <img src={track.artwork_url} className="w-10 h-10 rounded-lg object-cover shadow-sm" alt="Art" />
                    <div className="flex-1 truncate">
                      <div className="text-sm font-bold text-white truncate">{track.title}</div>
                      <div className="text-[11px] font-medium text-emerald-400 truncate">{track.artist}</div>
                    </div>
                  </motion.button>
                ))
              ) : searchQuery ? (
                <div className="p-4 text-center text-sm text-zinc-500">
                  Lagu tidak ditemukan.
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-zinc-500">
                  Ketik judul lagu atau artis...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoundCloudDynamicIsland;
