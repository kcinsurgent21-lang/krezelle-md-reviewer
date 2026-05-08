import { useState } from 'react'
import FlashcardDeck from '../components/flashcards/FlashcardDeck'
import useFlashcardStore from '../store/useFlashcardStore'
import { SUBJECTS } from '../data/sampleQuestions'
import { X } from 'lucide-react'

function AddCardModal({ onClose }) {
  const { addCard } = useFlashcardStore()
  const [form, setForm] = useState({ subject: SUBJECTS[0], front: '', back: '' })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!form.front.trim() || !form.back.trim()) return
    addCard(form)
    setSaved(true)
    setTimeout(onClose, 600)
  }

  const inp = 'w-full rounded-xl border-2 border-slate-200 focus:border-navy-500 outline-none px-3 py-2.5 text-sm bg-white text-slate-800 placeholder:text-slate-400 resize-none transition-colors'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">New Flashcard</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>

        <select
          className={inp}
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
        >
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Front (question/term)</label>
          <textarea className={inp} rows={3} placeholder="Enter term or question…" value={form.front} onChange={(e) => setForm((f) => ({ ...f, front: e.target.value }))} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Back (answer/definition)</label>
          <textarea className={inp} rows={4} placeholder="Enter answer or definition…" value={form.back} onChange={(e) => setForm((f) => ({ ...f, back: e.target.value }))} />
        </div>

        <button
          onClick={handleSave}
          disabled={!form.front.trim() || !form.back.trim() || saved}
          className="w-full py-3 rounded-2xl bg-navy-800 text-white font-bold text-sm disabled:opacity-40 hover:bg-navy-700 transition-colors"
        >
          {saved ? '✓ Saved!' : 'Save Card'}
        </button>
      </div>
    </div>
  )
}

export default function Flashcards() {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <>
      <FlashcardDeck onAddCard={() => setShowAdd(true)} />
      {showAdd && <AddCardModal onClose={() => setShowAdd(false)} />}
    </>
  )
}
