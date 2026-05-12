import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import useExamStore from '../../store/useExamStore'
import useExamTimer, { formatTime } from '../../hooks/useTimer'
import QuestionCard from './QuestionCard'

export default function ExamEngine() {
  const navigate = useNavigate()
  useExamTimer()

  const {
    status, questions, currentIndex, answers,
    config, timeRemaining,
    submitAnswer, nextQuestion, prevQuestion, finishExam,
  } = useExamStore()

  // Redirect if no exam active
  useEffect(() => {
    if (status === 'idle') navigate('/exam', { replace: true })
    if (status === 'finished') navigate('/exam/results', { replace: true })
  }, [status, navigate])

  if (!questions.length) return null

  const question = questions[currentIndex]
  const answer = answers[question.id]
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100
  const isLast = currentIndex === questions.length - 1
  const canFinish = answeredCount === questions.length

  const handleFinish = () => { finishExam(); navigate('/exam/results') }

  const handleNext = () => {
    if (isLast) {
      if (canFinish) handleFinish()
    } else {
      nextQuestion()
    }
  }

  const timerColor = config.timed && timeRemaining !== null
    ? timeRemaining < 60 ? 'text-red-500' : timeRemaining < 300 ? 'text-amber-500' : 'text-teal-400'
    : 'text-navy-300'

  return (
    <div className="flex flex-col min-h-[calc(100vh-7.5rem)]">
      {/* Sticky top bar */}
      <div className="sticky top-14 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 h-10 max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 font-medium flex-shrink-0">
            {answeredCount}/{questions.length}
          </span>
          {config.timed && (
            <span className={`text-xs font-bold font-mono flex-shrink-0 bg-navy-800 px-2 py-0.5 rounded-lg ${timerColor}`}>
              {formatTime(timeRemaining)}
            </span>
          )}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">
        <QuestionCard
          question={question}
          questionNumber={currentIndex + 1}
          total={questions.length}
          answer={answer}
          onAnswer={submitAnswer}
        />
      </div>

      {/* Bottom nav */}
      <div className="sticky bottom-16 bg-white border-t border-slate-100 px-4 py-3 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 active:bg-slate-50 transition-all"
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <div className="flex-1 text-center">
            <span className="text-xs text-slate-400 font-medium">
              {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {isLast ? (
            <button
              onClick={handleFinish}
              disabled={!canFinish}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors"
            >
              <Flag size={15} /> Finish
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 active:bg-navy-900 text-white font-semibold text-sm transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Question map */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {questions.map((q, i) => {
            const ans = answers[q.id]
            let cls = 'w-7 h-7 rounded-lg text-xs font-bold transition-all border-2 '
            if (i === currentIndex) cls += 'border-navy-700 bg-navy-100 text-navy-800 scale-110'
            else if (ans?.correct) cls += 'border-teal-400 bg-teal-100 text-teal-700'
            else if (ans && !ans.correct) cls += 'border-red-400 bg-red-100 text-red-700'
            else cls += 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            return (
              <button key={q.id} className={cls} onClick={() => useExamStore.getState().goToQuestion(i)}>
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
