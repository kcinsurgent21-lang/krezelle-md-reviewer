import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, Download, Trash2 } from 'lucide-react'
import useQuestionStore from '../../store/useQuestionStore'

const TEMPLATE = [
  {
    subject: 'Anatomy',
    question: 'Which bone forms the posterior cranial fossa?',
    choices: { A: 'Occipital bone', B: 'Frontal bone', C: 'Parietal bone', D: 'Temporal bone' },
    correctAnswer: 'A',
    rationale: {
      general: 'The occipital bone forms the floor and walls of the posterior cranial fossa.',
      A: 'CORRECT. The occipital bone is the primary contributor to the posterior cranial fossa, housing the cerebellum.',
      B: 'The frontal bone forms the anterior cranial fossa.',
      C: 'The parietal bones form the lateral walls of the skull vault.',
      D: 'The temporal bone contributes to the middle cranial fossa.',
    },
    difficulty: 'medium',
  },
]

export default function BulkImport({ onDone }) {
  const { bulkImport, replaceAll } = useQuestionStore()
  const [json, setJson] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('append') // 'append' | 'replace'
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setJson(ev.target.result)
    reader.readAsText(file)
  }

  const handleImport = () => {
    setError('')
    setResult(null)
    let parsed
    try {
      parsed = JSON.parse(json)
    } catch {
      setError('Invalid JSON. Please check your input and try again.')
      return
    }
    if (!Array.isArray(parsed)) {
      setError('JSON must be an array of question objects.')
      return
    }
    // Validate required fields
    const invalid = parsed.filter((q) => !q.subject || !q.question || !q.choices || !q.correctAnswer)
    if (invalid.length > 0) {
      setError(`${invalid.length} question(s) are missing required fields (subject, question, choices, correctAnswer).`)
      return
    }

    const res = mode === 'replace' ? { added: replaceAll(parsed), skipped: 0 } : bulkImport(parsed)
    setResult(res)
    setJson('')
    setTimeout(onDone, 1500)
  }

  const downloadTemplate = () => {
    const blob = new Blob([JSON.stringify(TEMPLATE, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'kmd_questions_template.json'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto animate-slide-up">
      {/* Download template */}
      <div className="card flex items-center justify-between py-4">
        <div>
          <p className="font-semibold text-slate-700 text-sm">JSON Template</p>
          <p className="text-xs text-slate-500 mt-0.5">Download and fill in your questions</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-50 border border-navy-200 text-navy-700 font-semibold text-sm hover:bg-navy-100 transition-colors"
        >
          <Download size={15} /> Template
        </button>
      </div>

      {/* Mode */}
      <div className="card space-y-2">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Import Mode</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'append',  label: 'Append',  desc: 'Add to existing questions (skip duplicates)' },
            { key: 'replace', label: 'Replace All', desc: 'Overwrite the entire question bank' },
          ].map(({ key, label, desc }) => (
            <button
              key={key} type="button"
              onClick={() => setMode(key)}
              className={`text-left p-3 rounded-xl border-2 transition-all ${mode === key ? 'border-navy-700 bg-navy-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <p className={`text-sm font-bold ${mode === key ? 'text-navy-800' : 'text-slate-700'}`}>{label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
        {mode === 'replace' && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 text-xs">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>Replace All will permanently overwrite your question bank.</span>
          </div>
        )}
      </div>

      {/* File upload */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-navy-400 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={28} className="mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-semibold text-slate-600">Upload JSON file</p>
        <p className="text-xs text-slate-400 mt-1">Click to browse or drag & drop</p>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
      </div>

      {/* Paste area */}
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
          Or paste JSON directly
        </label>
        <textarea
          className="w-full rounded-xl border-2 border-slate-200 focus:border-navy-500 outline-none px-3 py-2.5 text-xs font-mono text-slate-700 resize-none bg-slate-50"
          rows={8}
          placeholder='[{"subject":"Anatomy","question":"...","choices":{"A":"...","B":"...","C":"...","D":"..."},"correctAnswer":"A","rationale":{"general":"...","A":"...","B":"...","C":"...","D":"..."}}]'
          value={json}
          onChange={(e) => { setJson(e.target.value); setError('') }}
        />
        {json && (
          <button onClick={() => setJson('')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 mt-1">
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {result && (
        <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-700 text-sm animate-fade-in">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          {mode === 'replace'
            ? `Replaced with ${result.added} question(s).`
            : `Added ${result.added} question(s). Skipped ${result.skipped} duplicate(s).`}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={!json.trim()}
        className="w-full py-4 rounded-2xl bg-navy-800 hover:bg-navy-700 active:bg-navy-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2"
      >
        <FileText size={18} /> Import Questions
      </button>
    </div>
  )
}
