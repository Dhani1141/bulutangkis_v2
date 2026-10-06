import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { Play, Pause, Search, ArrowLeft, Music, SkipForward, SkipBack } from 'lucide-react'; // Adjust import based on your icon library

const SC_PLAYLIST = [
  { id: 1, title: 'FUNK DO BOUNCE (Slowed)', artist: 'Ariis', stream_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/78/bb/09/78bb0943-54db-5906-270e-f51b7f4211f3/mzaf_11235458155300568117.plus.aac.p.m4a', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 2, title: 'Brazilian Phonk Automotivo', artist: 'PHONK & Montagem', stream_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/83/0b/fe/830bfe11-4ea8-da4d-32b5-fe72854cc868/mzaf_5769007449919144696.plus.aac.p.m4a', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 3, title: 'Dark Pulse (Phonk)', artist: 'OCD F42', stream_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e3/06/21/e30621b9-0a06-4927-8779-f58a14839ec9/mzaf_5957398691056077498.plus.aac.p.m4a', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 4, title: 'Dark Pulse (Slowed)', artist: 'Phonk Montagem', stream_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e8/a7/74/e8a774f4-8a99-655c-236d-c66321353374/mzaf_13899044644026412254.plus.aac.p.m4a', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 5, title: 'Dark Pulse (Slowed Reverb)', artist: 'PHONK', stream_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b9/e8/88/b9e8884a-31d9-5fa6-4780-9e3e3336582e/mzaf_11372573903284384660.plus.aac.p.m4a', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 6, title: 'Dark Engine (Sped Up)', artist: 'OCD F42', stream_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/96/95/17/96951770-45f8-b723-5579-132d362f5068/mzaf_443424279666277532.plus.aac.p.m4a', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 7, title: 'Dark Engine (Slowed)', artist: 'Phonk Montagem', stream_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/80/d3/52/80d35249-f316-7753-1794-145c83b924bd/mzaf_11231361559234470985.plus.aac.p.m4a', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 8, title: 'Montagem Game (Nightcore)', artist: 'PHONK', stream_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/07/85/94/07859483-9b93-6951-5f33-5bdd701444b3/mzaf_15934730209694146481.plus.aac.p.m4a', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' }
];

const SoundCloudDynamicIsland = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(SC_PLAYLIST);
  
  // Player state
  const [currentTrack, setCurrentTrack] = useState(SC_PLAYLIST[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(SC_PLAYLIST);
    } else {
      const filtered = SC_PLAYLIST.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchQuery]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectTrack = (track) => {
    setCurrentTrack(track);
    setIsSearching(false);
    setSearchQuery('');
    setPlayed(0);
    setIsPlaying(true);
  };

  const nextTrack = () => {
    const idx = SC_PLAYLIST.findIndex(t => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % SC_PLAYLIST.length;
    handleSelectTrack(SC_PLAYLIST[nextIdx]);
  };

  const prevTrack = () => {
    const idx = SC_PLAYLIST.findIndex(t => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + SC_PLAYLIST.length) % SC_PLAYLIST.length;
    handleSelectTrack(SC_PLAYLIST[prevIdx]);
  };

  return (
    <div className="relative">
      {/* HIDDEN REACT PLAYER FOR SC AUDIO */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '300px', height: '300px', pointerEvents: 'none', zIndex: -50 }}>
        <ReactPlayer 
          url={currentTrack.stream_url} 
          playing={isPlaying} 
          controls={false}
          width="300px"
          height="300px"
          onDuration={(d) => setDuration(d)}
          onProgress={(p) => setPlayed(p.playedSeconds)}
          onEnded={nextTrack}
          onError={(e) => {
            console.error("Audio Player Error:", e);
            setIsPlaying(false);
          }}
          
        />
      </div>

      {/* DYNAMIC ISLAND UI */}
      <motion.div
        className="absolute top-0 right-0 z-50 overflow-hidden bg-zinc-950/90 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-md rounded-[28px] focus-within:border-indigo-500/50"
        animate={{ width: isSearching ? 320 : 340, height: isSearching ? 380 : 64 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        <AnimatePresence mode="wait">
          {!isSearching ? (
            <motion.div
              key="player"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col justify-center h-full px-4 text-white"
            >
              <div className="flex items-center justify-between">
                {/* Left: Art & Title */}
                <div className="flex items-center gap-3 max-w-[160px]">
                  <img 
                    src={currentTrack.artwork_url} 
                    alt="Art" 
                    className={`w-9 h-9 rounded-full border border-white/20 object-cover ${isPlaying ? 'animate-spin [animation-duration:8s]' : ''}`}
                  />
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold truncate text-white">{currentTrack.title}</span>
                    <span className="text-[10px] text-zinc-400 truncate tracking-wider">SOUNDCLOUD</span>
                  </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-1.5">
                  <button onClick={prevTrack} className="text-zinc-400 hover:text-white transition active:scale-90"><SkipBack size={16} /></button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-white text-zinc-950 rounded-full hover:scale-105 transition active:scale-95 mx-1">
                    {isPlaying ? <Pause size={14} variant="bulk" /> : <Play size={14} variant="bulk" />}
                  </button>
                  <button onClick={nextTrack} className="text-zinc-400 hover:text-white transition active:scale-90"><SkipForward size={16} /></button>
                  <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                  <button onClick={() => setIsSearching(true)} className="p-1.5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-indigo-400 transition">
                    <Search size={16} />
                  </button>
                </div>
              </div>

              {/* Bottom: Progress Bar */}
              <div className="flex items-center gap-2 mt-1.5 px-1">
                <span className="text-[9px] text-zinc-500 w-6 text-right">{formatTime(played)}</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-linear"
                    style={{ width: `${(played / (duration || 1)) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-zinc-500 w-6">{formatTime(duration)}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-4 h-full flex flex-col text-white"
            >
              {/* Search Header */}
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="p-1 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition">
                  <ArrowLeft size={16} />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari lagu Phonk/Funk..."
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    autoFocus
                  />
                  <Search size={12} className="absolute left-3 top-2.5 text-zinc-500" />
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                {searchResults.length > 0 ? (
                  searchResults.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => handleSelectTrack(track)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-white/10 border border-transparent transition"
                    >
                      <img src={track.artwork_url} className="w-8 h-8 rounded-lg object-cover" alt="Art" />
                      <div className="flex-1 truncate">
                        <div className="text-xs font-medium text-zinc-100 truncate">{track.title}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{track.artist}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-zinc-500 text-center text-xs">
                    <Music size={24} className="mb-2 text-zinc-600" />
                    <span>Lagu tidak ditemukan di playlist!</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SoundCloudDynamicIsland;
