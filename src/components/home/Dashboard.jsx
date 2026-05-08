import { useNavigate } from 'react-router-dom'
import { BookOpen, Layers, TrendingUp, Award, ChevronRight, PlusCircle } from 'lucide-react'
import useQuestionStore from '../../store/useQuestionStore'
import useFlashcardStore from '../../store/useFlashcardStore'
import { SUBJECT_COLORS } from '../../data/sampleQuestions'

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { getStats: qStats } = useQuestionStore()
  const { getStats: fcStats, getDueCards } = useFlashcardStore()

  const qs = qStats()
  const fc = fcStats()
  const dueCount = getDueCards().length

  const topSubjects = Object.entries(qs.bySubject)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  return (
    <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 text-white p-5 shadow-lg">
        <p className="text-xs font-semibold text-navy-300 uppercase tracking-widest mb-1">Welcome back</p>
        <h2 className="text-xl font-bold leading-tight">Ready to review?</h2>
        <p className="text-sm text-navy-200 mt-1">Keep building your PLE confidence daily.</p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate('/exam')}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 transition-colors text-white font-semibold text-sm px-4 py-2.5 rounded-xl"
          >
            <BookOpen size={16} /> Start Exam
          </button>
          <button
            onClick={() => navigate('/flashcards')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors text-white font-semibold text-sm px-4 py-2.5 rounded-xl"
          >
            <Layers size={16} /> Flashcards {dueCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5">{dueCount}</span>}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Questions" value={qs.total} icon={BookOpen} color="bg-navy-800" />
        <StatCard label="Flashcards" value={fc.total} icon={Layers} color="bg-teal-600" />
        <StatCard label="Due for review" value={dueCount} icon={TrendingUp} color="bg-amber-500" />
        <StatCard label="Mastered cards" value={fc.byConfidence.easy || 0} icon={Award} color="bg-emerald-500" />
      </div>

      {/* Subject breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-700 text-sm">Question Bank</h3>
          <button onClick={() => navigate('/admin/add')} className="flex items-center gap-1 text-xs text-teal-600 font-semibold hover:text-teal-500">
            <PlusCircle size={14} /> Add Question
          </button>
        </div>
        <div className="space-y-2">
          {topSubjects.map(([subject, count]) => {
            const colors = SUBJECT_COLORS[subject] || { bg: 'bg-slate-100', text: 'text-slate-700' }
            return (
              <button
                key={subject}
                onClick={() => navigate('/exam')}
                className="w-full card flex items-center justify-between hover:shadow-md transition-shadow active:scale-[0.99] py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`subject-badge ${colors.bg} ${colors.text}`}>{subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">{count}</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
