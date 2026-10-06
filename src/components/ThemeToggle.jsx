import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // Initialize theme based on HTML class
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    
    const applyTheme = () => {
      setIsDark(nextTheme);
      if (nextTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (!document.startViewTransition) {
      applyTheme();
    } else {
      document.startViewTransition(() => {
        applyTheme();
      });
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        liquid-pill relative flex items-center w-[68px] h-[34px] rounded-full p-1 cursor-pointer
        ${isDark ? 'justify-start' : 'justify-end'}
      `}
      aria-label="Toggle Theme"
    >
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 700,
          damping: 30
        }}
        className={`
          flex items-center justify-center w-[26px] h-[26px] rounded-full shadow-lg z-10
          ${isDark ? 'bg-[#1a1a2e] border border-white/10' : 'bg-white border border-gray-200'}
        `}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 180, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={14} className="text-blue-400" fill="currentColor" fillOpacity={0.2} />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 180, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={14} className="text-orange-500" fill="currentColor" fillOpacity={0.2} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
