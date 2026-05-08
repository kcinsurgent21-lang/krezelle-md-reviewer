import { useState } from 'react'
import { Moon, Trash2, Download, AlertCircle, RefreshCw, Info } from 'lucide-react'
import useQuestionStore from '../store/useQuestionStore'
import useFlashcardStore from '../store/useFlashcardStore'
import useExamStore from '../store/useExamStore'
import sampleQuestions from '../data/sampleQuestions'

function SettingRow({ icon: Icon, label, sub, children, danger }) {
  return (
    <div className={`flex items-center justify-between py-4 border-b border-slate-100 last:border-0 ${danger ? 'text-red-600' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${danger ? 'bg-red-50' : 'bg-slate-100'}`}>
          <Icon size={16} className={danger ? 'text-red-500' : 'text-slate-600'} />
        </div>
        <div>
          <p className={`text-sm font-semibold ${danger ? 'text-red-700' : 'text-slate-700'}`}>{label}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

export default function Settings() {
  const { questions, replaceAll: replaceQuestions } = useQuestionStore()
  const { cards } = useFlashcardStore()
  const [confirm, setConfirm] = useState(null)
  const [msg, setMsg] = useState('')

  const handleExport = () => {
    const data = JSON.stringify(questions, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `kmd_questions_${Date.now()}.json`; a.click()
    URL.revokeObjectURL(url)
    setMsg('Questions exported!')
    setTimeout(() => setMsg(''), 2000)
  }

  const handleResetQuestions = () => {
    replaceQuestions(sampleQuestions)
    setConfirm(null)
    setMsg('Questions reset to defaults.')
    setTimeout(() => setMsg(''), 2000)
  }

  const handleClearFlashcards = () => {
    useFlashcardStore.setState({ cards: [] })
    setConfirm(null)
    setMsg('Flashcards cleared.')
    setTimeout(() => setMsg(''), 2000)
  }

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto animate-fade-in">
      {/* App info */}
      <div className="card py-5 text-center space-y-1">
        <div className="text-3xl mb-2">🩺</div>
        <p className="font-bold text-navy-800 text-lg">KrezelleMD Reviewer</p>
        <p className="text-xs text-slate-500">Physician Licensure Exam Study Tool</p>
        <p className="text-xs text-slate-400">v1.0.0 · Built with React + Vite + Tailwind</p>
      </div>

      {msg && (
        <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-700 text-sm animate-fade-in">
          <Info size={15} /> {msg}
        </div>
      )}

      {/* Data section */}
      <div className="card space-y-0 py-0">
        <SettingRow icon={Info} label="Question Bank" sub={`${questions.length} questions stored locally`}>
          <span className="text-sm font-bold text-navy-800">{questions.length}</span>
        </SettingRow>

        <SettingRow icon={Info} label="Flashcards" sub={`${cards.length} cards stored locally`}>
          <span className="text-sm font-bold text-navy-800">{cards.length}</span>
        </SettingRow>

        <SettingRow icon={Download} label="Export Questions" sub="Download all questions as JSON">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-xl bg-navy-50 border border-navy-200 text-navy-700 text-xs font-semibold hover:bg-navy-100 transition-colors"
          >
            Export
          </button>
        </SettingRow>
      </div>

      {/* Danger zone */}
      <div className="card space-y-0 py-0">
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest pt-4 pb-2 px-0">Danger Zone</p>

        <SettingRow icon={RefreshCw} label="Reset to Sample Questions" sub="Restore the original 24 sample questions" danger>
          <button
            onClick={() => setConfirm('reset')}
            className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
          >
            Reset
          </button>
        </SettingRow>

        <SettingRow icon={Trash2} label="Clear All Flashcards" sub="Permanently delete all flashcards" danger>
          <button
            onClick={() => setConfirm('cards')}
            className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
          >
            Clear
          </button>
        </SettingRow>
      </div>

      {/* PWA info */}
      <div className="card text-center space-y-1 py-4">
        <p className="text-xs font-semibold text-slate-600">Install as App</p>
        <p className="text-xs text-slate-400">Use your browser's "Add to Home Screen" to install KrezelleMD as a PWA for offline access.</p>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 animate-fade-in" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={22} />
              <p className="font-bold text-base">Are you sure?</p>
            </div>
            <p className="text-sm text-slate-600">
              {confirm === 'reset' ? 'This will replace your question bank with the 24 sample questions.' : 'All flashcards will be permanently deleted.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 font-semibold text-slate-700 text-sm">Cancel</button>
              <button
                onClick={confirm === 'reset' ? handleResetQuestions : handleClearFlashcards}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
