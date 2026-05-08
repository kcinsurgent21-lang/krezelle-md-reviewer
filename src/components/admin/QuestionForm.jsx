import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import useQuestionStore from '../../store/useQuestionStore'
import { SUBJECTS } from '../../data/sampleQuestions'

const BLANK = {
  subject: SUBJECTS[0],
  question: '',
  choices: { A: '', B: '', C: '', D: '' },
  correctAnswer: 'A',
  rationale: { general: '', A: '', B: '', C: '', D: '' },
  difficulty: 'medium',
}

export default function QuestionForm({ editId }) {
  const navigate = useNavigate()
  const { addQuestion, updateQuestion, questions } = useQuestionStore()

  const existing = editId ? questions.find((q) => q.id === editId) : null
  const [form, setForm] = useState(existing || BLANK)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const setField = (path, value) => {
    setError('')
    if (path.includes('.')) {
      const [top, key] = path.split('.')
      setForm((f) => ({ ...f, [top]: { ...f[top], [key]: value } }))
    } else {
      setForm((f) => ({ ...f, [path]: value }))
    }
  }

  const validate = () => {
    if (!form.question.trim()) return 'Question text is required.'
    if (!form.choices.A.trim() || !form.choices.B.trim() || !form.choices.C.trim() || !form.choices.D.trim())
      return 'All four choices are required.'
    if (!form.rationale.general.trim()) return 'General rationale is required.'
    return ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    if (existing) {
      updateQuestion(editId, form)
    } else {
      addQuestion(form)
    }
    setSaved(true)
    setTimeout(() => navigate('/admin'), 800)
  }

  const inputCls = 'w-full rounded-xl border-2 border-slate-200 focus:border-navy-500 outline-none px-3 py-2.5 text-sm text-slate-800 transition-colors bg-white placeholder:text-slate-400'
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5 max-w-2xl mx-auto animate-slide-up">
      {/* Subject & Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Subject</label>
          <select className={inputCls} value={form.subject} onChange={(e) => setField('subject', e.target.value)}>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Difficulty</label>
          <select className={inputCls} value={form.difficulty} onChange={(e) => setField('difficulty', e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Question */}
      <div>
        <label className={labelCls}>Question</label>
        <textarea
          className={`${inputCls} resize-none`} rows={4}
          placeholder="Enter the question text…"
          value={form.question}
          onChange={(e) => setField('question', e.target.value)}
        />
      </div>

      {/* Choices */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <label className={labelCls + ' mb-0'}>Choices</label>
          <div className="flex gap-2">
            {['A','B','C','D'].map((k) => (
              <button
                key={k} type="button"
                onClick={() => setField('correctAnswer', k)}
                className={`w-8 h-8 rounded-full text-xs font-bold border-2 transition-all
                  ${form.correctAnswer === k
                    ? 'border-teal-500 bg-teal-500 text-white'
                    : 'border-slate-300 text-slate-500 hover:border-teal-300'}`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-slate-400">Tap a letter above to mark as correct answer</p>
        <div className="space-y-2.5">
          {['A','B','C','D'].map((k) => (
            <div key={k} className="flex items-center gap-2">
              <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                form.correctAnswer === k ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-300 text-slate-500'
              }`}>{k}</span>
              <input
                className={inputCls}
                placeholder={`Choice ${k}…`}
                value={form.choices[k]}
                onChange={(e) => setField(`choices.${k}`, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rationale */}
      <div className="card space-y-3">
        <label className={labelCls + ' mb-0'}>Rationale</label>
        <div>
          <p className="text-[10px] text-slate-500 mb-1">General explanation</p>
          <textarea
            className={`${inputCls} resize-none`} rows={3}
            placeholder="Explain the correct answer and overall concept…"
            value={form.rationale.general}
            onChange={(e) => setField('rationale.general', e.target.value)}
          />
        </div>
        {['A','B','C','D'].map((k) => (
          <div key={k}>
            <p className="text-[10px] text-slate-500 mb-1">Why {k} is {form.correctAnswer === k ? 'CORRECT' : 'wrong'}</p>
            <input
              className={inputCls}
              placeholder={`Rationale for choice ${k}…`}
              value={form.rationale[k]}
              onChange={(e) => setField(`rationale.${k}`, e.target.value)}
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-700 text-sm animate-fade-in">
          <CheckCircle2 size={16} className="flex-shrink-0" /> Saved successfully!
        </div>
      )}

      <button
        type="submit"
        className="w-full py-4 rounded-2xl bg-navy-800 hover:bg-navy-700 active:bg-navy-900 text-white font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2"
      >
        <Save size={18} /> {existing ? 'Update Question' : 'Save Question'}
      </button>
    </form>
  )
}
