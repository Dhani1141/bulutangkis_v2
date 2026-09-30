import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

/**
 * Warning modal shown when "End Session" is clicked during an active match.
 * Offers two actions: "Wait" (dismiss) or "Cancel Match & End".
 */
export default function EndSessionModal({ isOpen, onClose, onWait, onCancelMatch }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div
              className="glass-strong rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-amber-500/20 shrink-0">
                  <AlertTriangle className="text-amber-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Match In Progress
                </h3>
                <button
                  onClick={onClose}
                  className="ml-auto p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Close modal"
                >
                  <X size={18} className="text-white/50" />
                </button>
              </div>

              {/* Body */}
              <p className="text-white/60 mb-8 leading-relaxed">
                A match is currently in progress. Wait for it to finish or
                cancel the current match?
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={onWait} className="glass-button flex-1">
                  Wait
                </button>
                <button
                  onClick={onCancelMatch}
                  className="glass-button-danger flex-1"
                >
                  Cancel &amp; End
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
