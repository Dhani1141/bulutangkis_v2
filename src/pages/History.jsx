import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FolderFloat from '../components/FolderFloat';
import { getSessionsFromFirestore } from '../lib/firebaseHelpers'; 

const WeeklySessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessionHistory = async () => {
      try {
        const sessionData = await getSessionsFromFirestore(); 
        setSessions(sessionData);
      } catch (error) {
        console.error("Error fetching sessions", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessionHistory();
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-32 md:pt-24 px-4 pb-12 relative z-10">
      <div className="text-center mb-10 max-w-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Riwayat Sesi Mingguan</h1>
        <p className="text-white/50 text-sm md:text-base">Pilih sesi tanggal untuk melihat data & top 5 pemain</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/50">
          <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin mb-4" />
          <p>Memuat sesi...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/50 bg-white/[0.02] border border-white/5 rounded-2xl w-full max-w-2xl text-center p-8">
          <p className="text-lg font-medium text-white/80 mb-2">Belum ada sesi yang dimainkan 🏸</p>
          <p className="text-sm">Bikin pertandingan baru di Dashboard buat nambahin riwayat di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 w-full max-w-3xl mx-auto">
          {sessions.map((session, index) => (
          <div 
            key={session.dateId} 
            className="flex items-center justify-center bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 relative group"
          >
            <FolderFloat
              items={session.topPlayers} // Array of top 5 players for this specific date
              label={`Sesi ${session.date}`} // e.g., "Sesi 06 Okt 2026"
              sublabel="5 Pemain"
              trigger="hover"
              closeOnSelect
              physics
              drift={0.4}
              onSelect={() => {
                // Clicking either the folder or its flying notes takes user to history view, filtered by that specific Date!
                localStorage.setItem('currentSessionId', session.dateId);
                navigate(`/leaderboard`);
              }}
              // Small and Minimalist Theming
              folderColor="rgba(39, 39, 42, 0.9)"
              frontColor="rgba(63, 63, 70, 0.95)"
              paperColor="#f5f5f5"
              itemColor="rgba(255, 255, 255, 0.9)"
              itemTextColor="#18181b"
              labelColor="#ffffff"
              width={180}
              height={130}
              radius={14}
              spread={140} // lowered for smaller screen footprint
              lift={22}
              tilt={6}
              flapAngle={32}
              restAngle={14}
              openDuration={480}
              stagger={40}
              bounce={0.25}
            />
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default WeeklySessionsPage;
