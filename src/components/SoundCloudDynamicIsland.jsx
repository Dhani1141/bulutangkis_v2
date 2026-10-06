import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Search, ArrowLeft, Music, SkipForward, SkipBack } from 'lucide-react';

const SC_PLAYLIST = [
  { id: 1, title: 'Montagem Tomada x Dame Un Grrr', artist: 'Danna Jo', stream_url: 'https://discoveryprovider.audius.co/v1/tracks/1gm6vpQ/stream?app_name=BuluTangkisApp', artwork_url: 'https://audius-content-10.figment.io/content/01JZPC618C3Z1CZXEGDJPN6V2R/150x150.jpg' },
  { id: 2, title: 'MEMPHIS - PHONK', artist: 'LAIMON 👨🏻‍🚀', stream_url: 'https://discoveryprovider.audius.co/v1/tracks/wGxZ2/stream?app_name=BuluTangkisApp', artwork_url: 'https://val004.open-audio-validator.com/content/Qmaj3yQNMba6ouXcSyV3JHZhucZX4rHyP8faqU4CWV89ma/150x150.jpg' },
  { id: 3, title: 'Ecco Phonk', artist: 'Weaver Beats', stream_url: 'https://discoveryprovider.audius.co/v1/tracks/NlV7dpp/stream?app_name=BuluTangkisApp', artwork_url: 'https://v.monophonic.digital/content/01JB0V3ZKMVGMVGVF8J3J50F0V/150x150.jpg' },
  { id: 4, title: 'I Tried Phonk', artist: 'Trvpinstein Beats', stream_url: 'https://discoveryprovider.audius.co/v1/tracks/6kOvR7Z/stream?app_name=BuluTangkisApp', artwork_url: 'https://v.monophonic.digital/content/Qmba7PosQf6W9NKF4toqP5fAQbPAzpHgyH6PhjDoQ8kKeL/150x150.jpg' },
  { id: 5, title: 'Phree Phonk', artist: 'OJ TOMI', stream_url: 'https://discoveryprovider.audius.co/v1/tracks/yyAxrWr/stream?app_name=BuluTangkisApp', artwork_url: 'https://audius-creator-13.theblueprint.xyz/content/01JYKQAHRYWX0Z2EMK830JSJ3Q/150x150.jpg' },
  { id: 6, title: 'Tholy Phonk', artist: 'THOLY', stream_url: 'https://discoveryprovider.audius.co/v1/tracks/2l62pqp/stream?app_name=BuluTangkisApp', artwork_url: 'https://audius-creator-11.theblueprint.xyz/content/01K2J7SHKZ1VK3M17G965FPD9Y/150x150.jpg' },
  { id: 7, title: '1995 (PHONK REMIX)', artist: 'Music Altern Dj', stream_url: 'https://discoveryprovider.audius.co/v1/tracks/qZYjoYM/stream?app_name=BuluTangkisApp', artwork_url: 'https://audius-content-13.figment.io/content/01KD6DVGWQ5MVFH5RSBG6RP234/150x150.jpg' },
  { id: 8, title: 'METATRADER Phonk', artist: 'Phonkid Prod', stream_url: 'https://discoveryprovider.audius.co/v1/tracks/5jlM7/stream?app_name=BuluTangkisApp', artwork_url: 'https://v.monophonic.digital/content/QmULVrHFbbmaELAbz6BqmjacpuxEXWBQJVhfxRxYZV4GN3/150x150.jpg' }
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
  
  const audioRef = useRef(null);

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

  // Sync isPlaying state with native audio element
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Play prevented:", error);
          // Only force pause state if it's a true rejection, not an abort
          if (error.name !== 'AbortError') {
            setIsPlaying(false);
          }
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

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
      {/* NATIVE HTML5 AUDIO ELEMENT (No ReactPlayer iframe bugs!) */}
      <audio
        ref={audioRef}
        src={currentTrack.stream_url}
        onTimeUpdate={() => setPlayed(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={nextTrack}
        preload="auto"
      />

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
                    <span className="text-[10px] text-zinc-400 truncate tracking-wider">AUDIUS</span>
                  </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-1.5">
                  <button onClick={prevTrack} className="text-zinc-400 hover:text-white transition active:scale-90"><SkipBack size={16} /></button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-white text-zinc-950 rounded-full hover:scale-105 transition active:scale-95 mx-1">
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
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