import { useState } from 'react'
import { ChevronLeft, ChevronRight, PlusCircle, Filter, BarChart2 } from 'lucide-react'
import useFlashcardStore from '../../store/useFlashcardStore'
import { SUBJECTS } from '../../data/sampleQuestions'
import FlipCard from './FlipCard'

const CONFIDENCE_COLORS = {
  new:   { bg: 'bg-slate-200',  text: 'text-slate-700', label: 'New'    },
  again: { bg: 'bg-red-200',    text: 'text-red-800',   label: 'Again'  },
  hard:  { bg: 'bg-orange-200', text: 'text-orange-800',label: 'Hard'   },
  good:  { bg: 'bg-blue-200',   text: 'text-blue-800',  label: 'Good'   },
  easy:  { bg: 'bg-teal-200',   text: 'text-teal-800',  label: 'Easy'   },
}

export default function FlashcardDeck({ onAddCard }) {
  const {
    activeSubjectFilter, setFilter, currentCardIndex, setCardIndex,
    rateCard, getFilteredCards, getStats, resetSessionStats, sessionStats,
  } = useFlashcardStore()

  const [showStats, setShowStats] = useState(false)
  const cards = getFilteredCards()
  const stats = getStats()

  const card = cards[currentCardIndex]
  const total = cards.length

  const handleRate = (id, rating) => {
    rateCard(id, rating)
    if (currentCardIndex < total - 1) {
      setTimeout(() => setCardIndex(currentCardIndex + 1), 300)
    }
  }

  const prev = () => setCardIndex(Math.max(0, currentCardIndex - 1))
  const next = () => setCardIndex(Math.min(total - 1, currentCardIndex + 1))

  return (
    <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto animate-fade-in">
      {/* Filter row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-thin">
        {['All', ...SUBJECTS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${activeSubjectFilter === s
                ? 'bg-navy-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(stats.byConfidence).map(([conf, count]) => {
            const c = CONFIDENCE_COLORS[conf]
            return count > 0 ? (
              <span key={conf} className={`subject-badge ${c.bg} ${c.text}`}>{c.label}: {count}</span>
            ) : null
          })}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowStats((v) => !v)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
            <BarChart2 size={16} />
          </button>
          <button onClick={onAddCard} className="flex items-center gap-1 text-xs text-teal-600 font-semibold hover:text-teal-500">
            <PlusCircle size={14} /> Add
          </button>
        </div>
      </div>

      {showStats && (
        <div className="card bg-slate-50 space-y-2 text-sm animate-fade-in">
          <p className="font-bold text-slate-700">Session Stats</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[['Reviewed', sessionStats.reviewed], ['Correct (Good+Easy)', sessionStats.good + sessionStats.easy], ['Need review (Again+Hard)', sessionStats.again + sessionStats.hard]].map(([l, v]) => (
              <div key={l} className="bg-white rounded-xl p-2 border border-slate-200">
                <p className="text-lg font-bold text-slate-800">{v}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{l}</p>
              </div>
            ))}
          </div>
          <button onClick={resetSessionStats} className="text-xs text-slate-500 hover:underline">Reset session stats</button>
        </div>
      )}

      {/* Card */}
      {total === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <p className="text-slate-500 font-medium">No flashcards for this filter.</p>
          <button onClick={onAddCard} className="text-sm text-teal-600 font-semibold hover:underline">Add your first card</button>
        </div>
      ) : card ? (
        <>
          <FlipCard card={card} onRate={handleRate} />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prev} disabled={currentCardIndex === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm disabled:opacity-30 hover:border-slate-300 transition-all"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-xs text-slate-400 font-medium">{currentCardIndex + 1} / {total}</span>
            <button
              onClick={next} disabled={currentCardIndex === total - 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm disabled:opacity-30 hover:border-slate-300 transition-all"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Confidence badge */}
          {card.confidence !== 'new' && (
            <div className="text-center">
              <span className={`subject-badge ${CONFIDENCE_COLORS[card.confidence]?.bg} ${CONFIDENCE_COLORS[card.confidence]?.text}`}>
                Last rated: {CONFIDENCE_COLORS[card.confidence]?.label}
              </span>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
