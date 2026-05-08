import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Search, Edit2, Trash2, Upload, BookOpen, AlertCircle } from 'lucide-react'
import useQuestionStore from '../../store/useQuestionStore'
import { SUBJECTS, SUBJECT_COLORS } from '../../data/sampleQuestions'

const DIFF_COLORS = {
  easy:   'bg-teal-100 text-teal-700',
  medium: 'bg-amber-100 text-amber-700',
  hard:   'bg-red-100 text-red-700',
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const { questions, deleteQuestion, getStats } = useQuestionStore()
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [deleteId, setDeleteId] = useState(null)

  const stats = getStats()

  const filtered = questions.filter((q) => {
    const matchesSubject = subjectFilter === 'All' || q.subject === subjectFilter
    const matchesSearch = !search || q.question.toLowerCase().includes(search.toLowerCase())
    return matchesSubject && matchesSearch
  })

  const confirmDelete = (id) => setDeleteId(id)
  const handleDelete = () => { deleteQuestion(deleteId); setDeleteId(null) }

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto animate-fade-in">
      {/* Stats */}
      <div className="card flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-navy-700" />
          <span className="font-bold text-slate-700">{stats.total} Questions</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/import')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <Upload size={13} /> Bulk Import
          </button>
          <button
            onClick={() => navigate('/admin/add')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 text-white text-xs font-semibold hover:bg-navy-700 transition-colors"
          >
            <PlusCircle size={13} /> Add New
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-navy-500 outline-none text-sm bg-white text-slate-700 placeholder:text-slate-400"
          placeholder="Search questions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Subject filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-thin">
        {['All', ...SUBJECTS].map((s) => (
          <button
            key={s}
            onClick={() => setSubjectFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${subjectFilter === s
                ? 'bg-navy-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            {s === 'All' ? `All (${stats.total})` : `${s} (${stats.bySubject[s] || 0})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="card text-center py-10 space-y-2">
            <p className="text-slate-500">No questions found.</p>
            <button onClick={() => navigate('/admin/add')} className="text-sm text-teal-600 font-semibold hover:underline">Add your first question</button>
          </div>
        ) : (
          filtered.map((q) => {
            const colors = SUBJECT_COLORS[q.subject] || { bg: 'bg-slate-100', text: 'text-slate-700' }
            return (
              <div key={q.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`subject-badge ${colors.bg} ${colors.text}`}>{q.subject}</span>
                      {q.difficulty && (
                        <span className={`subject-badge ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 font-medium line-clamp-2">{q.question}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Correct: <span className="font-semibold text-teal-700">{q.correctAnswer} — {q.choices?.[q.correctAnswer]}</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/admin/edit/${q.id}`)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-navy-50 hover:text-navy-700 transition-colors"
                      aria-label="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => confirmDelete(q.id)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={22} />
              <p className="font-bold text-base">Delete Question?</p>
            </div>
            <p className="text-sm text-slate-600">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 font-semibold text-slate-700 text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
