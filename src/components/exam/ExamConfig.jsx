import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, Shuffle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import useExamStore from '../../store/useExamStore'
import useQuestionStore from '../../store/useQuestionStore'
import { SUBJECTS, SUBJECT_COLORS } from '../../data/sampleQuestions'

export default function ExamConfig() {
  const navigate = useNavigate()
  const { config, setConfig, startExam } = useExamStore()
  const { getBySubjects } = useQuestionStore()
  const [error, setError] = useState('')

  const toggleSubject = (subject) => {
    setError('')
    const current = config.subjects
    const next = current.includes(subject)
      ? current.filter((s) => s !== subject)
      : [...current, subject]
    setConfig({ subjects: next })
  }

  const selectAll = () => setConfig({ subjects: [...SUBJECTS] })
  const clearAll = () => setConfig({ subjects: [] })

  const handleStart = () => {
    const pool = getBySubjects(config.subjects)
    if (pool.length === 0) {
      setError('No questions found for the selected subjects. Please add questions via the Editor.')
      return
    }
    startExam(pool)
    navigate('/exam/active')
  }

  const pool = getBySubjects(config.subjects)
  const available = pool.length
  const limit = Math.min(config.questionLimit, available)

  return (
    <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto animate-slide-up">
      {/* Subject selector */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <BookOpen size={16} className="text-navy-700" /> Subjects
          </h3>
          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs text-teal-600 font-semibold hover:underline">All</button>
            <span className="text-slate-300">|</span>
            <button onClick={clearAll} className="text-xs text-slate-500 font-semibold hover:underline">Clear</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SUBJECTS.map((subject) => {
            const selected = config.subjects.includes(subject)
            const colors = SUBJECT_COLORS[subject] || { bg: 'bg-slate-100', text: 'text-slate-700' }
            return (
              <button
                key={subject}
                onClick={() => toggleSubject(subject)}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-semibold text-left transition-all duration-150
                  ${selected
                    ? 'border-navy-700 bg-navy-50 text-navy-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}
                `}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selected ? 'bg-navy-700' : 'bg-slate-300'}`} />
                <span className="truncate">{subject}</span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-500 text-right">{available} question{available !== 1 ? 's' : ''} available</p>
      </div>

      {/* Question limit */}
      <div className="card space-y-3">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <Shuffle size={16} className="text-navy-700" /> Question Limit
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={config.questionLimit}
            onChange={(e) => setConfig({ questionLimit: Number(e.target.value) })}
            className="flex-1 accent-navy-800"
          />
          <div className="text-center">
            <span className="text-2xl font-bold text-navy-800">{limit}</span>
            <p className="text-[10px] text-slate-500">questions</p>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>5</span><span>30</span><span>60</span><span>90</span><span>120</span>
        </div>
      </div>

      {/* Timed mode */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Clock size={16} className="text-navy-700" /> Timed Mode
          </h3>
          <button
            onClick={() => setConfig({ timed: !config.timed })}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${config.timed ? 'bg-teal-500' : 'bg-slate-300'}`}
            aria-label="Toggle timed mode"
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${config.timed ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
        {config.timed && (
          <div className="flex items-center gap-4 pt-1">
            <label className="text-sm text-slate-600 flex-shrink-0">Time limit</label>
            <input
              type="range"
              min={10}
              max={180}
              step={10}
              value={config.timeLimitMinutes}
              onChange={(e) => setConfig({ timeLimitMinutes: Number(e.target.value) })}
              className="flex-1 accent-teal-500"
            />
            <span className="text-sm font-bold text-teal-600 w-16 text-right">{config.timeLimitMinutes} min</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={available === 0}
        className="w-full py-4 rounded-2xl bg-navy-800 hover:bg-navy-700 active:bg-navy-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base transition-colors shadow-md"
      >
        Start Exam · {limit} Questions
      </button>
    </div>
  )
}
