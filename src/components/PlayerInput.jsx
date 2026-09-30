import { Trash2 } from 'lucide-react'

/**
 * Single player name input row with index badge and remove button.
 */
export default function PlayerInput({
  index,
  value,
  onChange,
  onRemove,
  canRemove,
}) {
  return (
    <div className="flex items-center gap-3 group">
      {/* Index badge */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-white/40 text-sm font-medium shrink-0">
        {index + 1}
      </div>

      {/* Name input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`Player ${index + 1}`}
        className="glass-input flex-1"
        autoComplete="off"
      />

      {/* Remove button */}
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 rounded-lg hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-all duration-300 shrink-0"
          aria-label={`Remove player ${index + 1}`}
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  )
}
