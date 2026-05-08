import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { SUBJECT_COLORS } from '../../data/sampleQuestions'

const CONFIDENCE_BUTTONS = [
  { key: 'again', label: 'Again', emoji: '😟', bg: 'bg-red-100 hover:bg-red-200 text-red-700 border-red-200' },
  { key: 'hard',  label: 'Hard',  emoji: '😬', bg: 'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200' },
  { key: 'good',  label: 'Good',  emoji: '🙂', bg: 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200' },
  { key: 'easy',  label: 'Easy',  emoji: '😄', bg: 'bg-teal-100 hover:bg-teal-200 text-teal-700 border-teal-200' },
]

export default function FlipCard({ card, onRate }) {
  const [flipped, setFlipped] = useState(false)
  const [rated,   setRated]   = useState(false)
  const colors = SUBJECT_COLORS[card.subject] || { bg: 'bg-slate-100', text: 'text-slate-700' }

  const handleFlip = () => setFlipped((v) => !v)

  const handleRate = (rating) => {
    setRated(true)
    onRate(card.id, rating)
    setTimeout(() => { setRated(false); setFlipped(false) }, 300)
  }

  return (
    <div className="space-y-4">
      {/* Card face */}
      <div
        className="flip-card-container cursor-pointer select-none"
        style={{ height: '280px' }}
        onClick={handleFlip}
        role="button"
        aria-label="Flip card"
      >
        <div className={`flip-card-inner w-full h-full ${flipped ? 'flipped' : ''}`}>

          {/* ── Front ─────────────────────────────────────────────────────── */}
          <div className="flip-card-face card flex flex-col justify-between p-5 border-2 border-navy-200 bg-gradient-to-br from-white to-navy-50">
            <div className="flex items-center justify-between">
              <span className={`subject-badge ${colors.bg} ${colors.text}`}>{card.subject}</span>
              <span className="text-xs text-navy-400 font-sans font-medium">Tap to reveal</span>
            </div>

            <div className="flex-1 flex items-center justify-center py-4 px-2">
              {/* Merriweather for the question/term text */}
              <p className="flashcard-text">{card.front}</p>
            </div>

            <div className="flex items-center justify-center gap-1 text-xs text-navy-400 font-sans">
              <RefreshCw size={12} /> <span>FRONT</span>
            </div>
          </div>

          {/* ── Back ──────────────────────────────────────────────────────── */}
          <div className="flip-card-face flip-card-back card flex flex-col justify-between p-5 border-2 border-teal-300 bg-gradient-to-br from-white to-teal-50">
            <div className="flex items-center justify-between">
              <span className={`subject-badge ${colors.bg} ${colors.text}`}>{card.subject}</span>
              <span className="text-xs text-teal-500 font-sans font-medium">ANSWER</span>
            </div>

            <div className="flex-1 flex items-center justify-center py-4 px-2">
              {/* Merriweather Light for the answer/definition text */}
              <p className="flashcard-text-back">{card.back}</p>
            </div>

            <div className="flex items-center justify-center gap-1 text-xs text-teal-500 font-sans">
              <RefreshCw size={12} /> <span>BACK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence buttons — appear after flip, system-ui for fast tapping */}
      {flipped && (
        <div className="animate-slide-up space-y-2">
          <p className="text-xs text-center text-slate-500 font-sans font-medium">How well did you know this?</p>
          <div className="grid grid-cols-4 gap-2">
            {CONFIDENCE_BUTTONS.map(({ key, label, emoji, bg }) => (
              <button
                key={key}
                onClick={(e) => { e.stopPropagation(); handleRate(key) }}
                disabled={rated}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 font-semibold font-sans text-xs transition-all active:scale-95 ${bg}`}
              >
                <span className="text-lg">{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
