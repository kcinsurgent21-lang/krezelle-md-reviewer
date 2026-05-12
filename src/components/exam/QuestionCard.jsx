import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { SUBJECT_COLORS } from '../../data/sampleQuestions'
import { useState } from 'react'

function RationaleBlock({ question, answer }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 overflow-hidden animate-slide-up">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-teal-800 font-semibold text-sm"
      >
        <span className="flex items-center gap-2"><Lightbulb size={16} /> Rationale</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-teal-200">
          {/* General explanation — shown for every answer */}
          {question.rationale?.general && (
            <p className="rationale-text text-teal-900 pt-3">{question.rationale.general}</p>
          )}

          <div className="space-y-2">
            {Object.keys(question.choices).map((key) => {
              const isCorrect  = key === question.correctAnswer
              const isSelected = key === answer?.selected
              const isWrong    = isSelected && !isCorrect

              return (
                <div
                  key={key}
                  className={`rounded-xl p-3 border transition-all ${
                    isCorrect ? 'border-teal-400 bg-teal-100'
                    : isWrong  ? 'border-red-300 bg-red-50'
                    :            'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Key letter */}
                    <span className={`flex-shrink-0 font-bold font-sans text-sm ${
                      isCorrect ? 'text-teal-700' : isWrong ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {key}.
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Choice text */}
                        <p className={`font-sans font-medium text-sm ${
                          isCorrect ? 'text-teal-800' : isWrong ? 'text-red-700' : 'text-slate-700'
                        }`}>
                          {question.choices[key]}
                        </p>
                        {/* Visual badge — YOUR ANSWER or CORRECT */}
                        {isSelected && isCorrect && (
                          <span className="text-[10px] font-bold font-sans bg-teal-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                            YOUR ANSWER ✓
                          </span>
                        )}
                        {isSelected && isWrong && (
                          <span className="text-[10px] font-bold font-sans bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                            YOUR ANSWER ✗
                          </span>
                        )}
                        {!isSelected && isCorrect && (
                          <span className="text-[10px] font-bold font-sans bg-teal-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                            CORRECT
                          </span>
                        )}
                      </div>
                      {/* Per-choice rationale — always shown */}
                      {question.rationale?.[key] && (
                        <p className="rationale-choice mt-1">{question.rationale[key]}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuestionCard({ question, questionNumber, total, answer, onAnswer }) {
  const colors     = SUBJECT_COLORS[question.subject] || { bg: 'bg-slate-100', text: 'text-slate-700' }
  const isAnswered = !!answer
  const isCorrect  = answer?.correct

  // Clicking ANY choice immediately locks + shows full rationale
  const handleChoice = (key) => { if (isAnswered) return; onAnswer(question.id, key) }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Subject + progress */}
      <div className="flex items-center justify-between">
        <span className={`subject-badge ${colors.bg} ${colors.text}`}>{question.subject}</span>
        <span className="text-xs text-slate-500 font-medium">{questionNumber} / {total}</span>
      </div>

      {/* Question stem — Merriweather for clinical reading clarity */}
      <div className="card">
        <p className="question-text text-balance">{question.question}</p>
      </div>

      {/* Answer choices — choices are pre-shuffled by Fisher-Yates in the store */}
      <div className="space-y-2.5">
        {Object.entries(question.choices).map(([key, text]) => {
          const isSelected   = answer?.selected === key
          const isCorrectKey = key === question.correctAnswer
          let btnClass = 'option-btn option-default'

          if (isAnswered) {
            if      (isSelected && isCorrect)  btnClass = 'option-btn option-correct'
            else if (isSelected && !isCorrect) btnClass = 'option-btn option-wrong'
            else if (isCorrectKey)             btnClass = 'option-btn option-reveal'
            else                               btnClass = 'option-btn border-slate-200 bg-white text-slate-400 cursor-default'
          }

          return (
            <button key={key} className={btnClass} onClick={() => handleChoice(key)} disabled={isAnswered}>
              <div className="flex items-start gap-3">
                {/* Letter bubble */}
                <span className={`
                  flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold font-sans
                  ${isAnswered && isSelected && isCorrect  ? 'border-teal-500 bg-teal-500 text-white' :
                    isAnswered && isSelected && !isCorrect ? 'border-red-500  bg-red-500  text-white' :
                    isAnswered && isCorrectKey             ? 'border-teal-500 bg-teal-500 text-white' :
                    'border-current'}
                `}>
                  {isAnswered && isSelected && isCorrect  ? <CheckCircle2 size={12} /> :
                   isAnswered && isSelected && !isCorrect ? <XCircle      size={12} /> :
                   isAnswered && isCorrectKey             ? <CheckCircle2 size={12} /> :
                   key}
                </span>

                <span className="flex-1 leading-snug font-sans">{text}</span>

                {/* Inline badge on the choice row */}
                {isAnswered && isSelected && (
                  <span className={`flex-shrink-0 text-[10px] font-bold font-sans px-1.5 py-0.5 rounded-full leading-none ${
                    isCorrect ? 'bg-teal-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {isCorrect ? 'CORRECT ✓' : 'WRONG ✗'}
                  </span>
                )}
                {isAnswered && !isSelected && isCorrectKey && (
                  <span className="flex-shrink-0 text-[10px] font-bold font-sans px-1.5 py-0.5 rounded-full leading-none bg-teal-500 text-white">
                    ANSWER
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Result feedback bar */}
      {isAnswered && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm font-sans animate-fade-in ${
          isCorrect ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'
        }`}>
          {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {isCorrect
            ? 'Correct! See rationale below.'
            : `Incorrect — correct answer is ${question.correctAnswer}. See rationale below.`}
        </div>
      )}

      {/* Rationale — always shown immediately after ANY answer */}
      {isAnswered && <RationaleBlock question={question} answer={answer} />}
    </div>
  )
}
