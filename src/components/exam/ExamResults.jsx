import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, RotateCcw, Home, CheckCircle2, XCircle, BookOpen } from 'lucide-react'
import useExamStore from '../../store/useExamStore'
import { SUBJECT_COLORS } from '../../data/sampleQuestions'

function ScoreRing({ score }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#0d9488' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      <text x="50" y="54" textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>
        {score}%
      </text>
    </svg>
  )
}

export default function ExamResults() {
  const navigate = useNavigate()
  const { status, getResults, resetExam, questions, answers, revealed } = useExamStore()

  useEffect(() => {
    if (status === 'idle') navigate('/exam', { replace: true })
  }, [status, navigate])

  const results = getResults()
  const passing = results.score >= 75

  const handleRetry = () => { resetExam(); navigate('/exam') }
  const handleHome = () => { resetExam(); navigate('/') }

  return (
    <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Score */}
      <div className="card flex flex-col items-center gap-3 py-6">
        <ScoreRing score={results.score} />
        <div className="text-center">
          <p className={`text-xl font-bold ${passing ? 'text-teal-700' : 'text-red-600'}`}>
            {passing ? '🎉 Passed!' : 'Keep Practicing'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {results.correct} correct · {results.incorrect} wrong · {results.total} total
          </p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${passing ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-700'}`}>
          {passing ? 'Above 75% passing threshold' : 'Below 75% passing threshold'}
        </div>
      </div>

      {/* By subject */}
      {Object.keys(results.bySubject).length > 0 && (
        <div className="card space-y-3">
          <h3 className="font-bold text-slate-700 text-sm">Performance by Subject</h3>
          <div className="space-y-2.5">
            {Object.entries(results.bySubject).map(([subject, data]) => {
              const pct = Math.round((data.correct / data.total) * 100)
              const colors = SUBJECT_COLORS[subject] || { bg: 'bg-slate-100', text: 'text-slate-700' }
              return (
                <div key={subject}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`subject-badge ${colors.bg} ${colors.text}`}>{subject}</span>
                    <span className="text-xs font-bold text-slate-600">{data.correct}/{data.total} · {pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 75 ? 'bg-teal-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${pct}%`, transition: 'width 0.8s ease-out' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Review wrong answers */}
      <div className="card space-y-3">
        <h3 className="font-bold text-slate-700 text-sm">Question Review</h3>
        <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          {questions.map((q, i) => {
            const ans = answers[q.id]
            return (
              <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${
                ans?.correct ? 'border-teal-200 bg-teal-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex-shrink-0 mt-0.5">
                  {ans?.correct
                    ? <CheckCircle2 size={14} className="text-teal-600" />
                    : <XCircle size={14} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 line-clamp-2">{q.question}</p>
                  {!ans?.correct && ans && (
                    <p className="mt-0.5 text-slate-500">
                      Your answer: <span className="font-semibold text-red-600">{ans.selected} — {q.choices[ans.selected]}</span>
                    </p>
                  )}
                  {!ans?.correct && (
                    <p className="mt-0.5 text-slate-500">
                      Correct: <span className="font-semibold text-teal-700">{q.correctAnswer} — {q.choices[q.correctAnswer]}</span>
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleRetry} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-navy-800 text-white font-bold text-sm hover:bg-navy-700 active:bg-navy-900 transition-colors">
          <RotateCcw size={16} /> Try Again
        </button>
        <button onClick={handleHome} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 active:bg-slate-50 transition-colors">
          <Home size={16} /> Home
        </button>
      </div>
    </div>
  )
}
