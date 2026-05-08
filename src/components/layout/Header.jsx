import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Stethoscope } from 'lucide-react'
import useExamStore from '../../store/useExamStore'
import SyncStatus from './SyncStatus'

const TITLES = {
  '/':            { title: 'KrezelleMD',        sub: 'PLE Reviewer'              },
  '/exam':        { title: 'Exam',               sub: 'Configure your session'    },
  '/exam/active': { title: 'Exam',               sub: 'In progress'               },
  '/exam/results':{ title: 'Results',            sub: 'Exam summary'              },
  '/flashcards':  { title: 'Flashcards',         sub: 'Anki-style review'         },
  '/admin':       { title: 'Question Editor',    sub: 'Manage your question bank' },
  '/admin/add':   { title: 'Add Question',       sub: 'New question'              },
  '/admin/import':{ title: 'Bulk Import',        sub: 'Import from JSON'          },
  '/settings':    { title: 'Settings',           sub: 'App preferences'           },
}

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const status = useExamStore((s) => s.status)

  const meta = TITLES[pathname] || TITLES['/']
  const showBack     = pathname !== '/' && !pathname.startsWith('/exam/active')
  const showStopExam = pathname === '/exam/active' && status === 'active'

  return (
    <header className="sticky top-0 z-40 bg-navy-800 text-white shadow-md">
      <div className="flex items-center gap-2 px-4 h-14 max-w-2xl mx-auto">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors flex-shrink-0"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div className="p-1.5 text-teal-400 flex-shrink-0">
            <Stethoscope size={22} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-bold text-base leading-tight truncate">{meta.title}</p>
          <p className="text-[11px] text-navy-300 leading-tight truncate">{meta.sub}</p>
        </div>

        {/* Sync status — always visible */}
        <SyncStatus />

        {showStopExam && (
          <button
            onClick={() => { useExamStore.getState().finishExam(); navigate('/exam/results') }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors flex-shrink-0"
          >
            End Exam
          </button>
        )}
      </div>
    </header>
  )
}
