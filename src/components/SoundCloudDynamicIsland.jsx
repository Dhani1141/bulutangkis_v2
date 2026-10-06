import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { Play, Pause, Search, ArrowLeft, Music, SkipForward, SkipBack } from 'lucide-react'; // Adjust import based on your icon library

const SC_PLAYLIST = [
  { id: 1, title: 'Acido Funk (Slowed)', artist: 'Jahson Medina', stream_url: 'https://soundcloud.com/jahson-medina/acido-funk-slowed', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 2, title: 'Swaggin at the Partment (Slowed)', artist: 'Ghostfaceplaya', stream_url: 'https://soundcloud.com/ghostfaceplaya/swaggin-at-the-partment-slowed', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 3, title: 'Enough Slay (Mega Phonk Mashup)', artist: 'Jerberlazaro', stream_url: 'https://soundcloud.com/jerberlazaromusic/eternxlkz-enough-slay-tiktok-mega-phonk-mashup', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 4, title: 'Avangard (Slowed)', artist: 'Lonown', stream_url: 'https://soundcloud.com/lonown6/avangard-slowed', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 5, title: 'Andromeda & KVRXD - No Fear', artist: 'Tribal Trap', stream_url: 'https://soundcloud.com/tribaltrapmusic/andromeda-kvrxd-no-fear', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 6, title: 'Mortals (Funk Remix)', artist: 'LXNGVX & Warriyo', stream_url: 'https://soundcloud.com/nocopyrightsounds/lxngvx-warriyo-mortals-funk-remix-ncs-release', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 7, title: 'Montagem Game (Super Slowed)', artist: 'Thibaud21', stream_url: 'https://soundcloud.com/thibaud21lol/montagem-game-super-slowed-par', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' },
  { id: 8, title: 'Montagem Tenta', artist: 'RandomFunkBR', stream_url: 'https://soundcloud.com/randomfunkbr9/montagem-tenta-1', artwork_url: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&q=80' }
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
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px', zIndex: -50, overflow: 'hidden' }}>
        <ReactPlayer 
          url={currentTrack.stream_url} 
          playing={isPlaying} 
          controls={false}
          width="1px"
          height="1px"
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
