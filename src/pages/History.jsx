import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function History() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-4xl pt-32 md:pt-24 px-4 pb-12 flex flex-col gap-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-2"
      >
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          History Kemenangan
        </h1>
      </motion.div>

      <GlassCard className="p-8 text-center text-white/70">
        <p>Fitur History Kemenangan sedang dalam pengembangan.</p>
        <p className="text-sm mt-2">Nantinya di sini akan muncul log pertandingan sebelumnya.</p>
      </GlassCard>
    </div>
  );
}
