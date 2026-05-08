import { NavLink, useLocation } from 'react-router-dom'
import { Home, BookOpen, Layers, Settings, ShieldCheck } from 'lucide-react'

const navItems = [
  { to: '/',           label: 'Home',       Icon: Home        },
  { to: '/exam',       label: 'Exam',       Icon: BookOpen    },
  { to: '/flashcards', label: 'Flashcards', Icon: Layers      },
  { to: '/admin',      label: 'Editor',     Icon: ShieldCheck },
  { to: '/settings',   label: 'Settings',   Icon: Settings    },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 safe-bottom z-50">
      <div className="flex items-stretch h-16 max-w-xl mx-auto">
        {navItems.map(({ to, label, Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative group"
            >
              <div className={`
                flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-150
                ${active ? 'text-navy-800' : 'text-slate-400 group-hover:text-slate-600'}
              `}>
                <div className={`
                  p-1.5 rounded-xl transition-all duration-150
                  ${active ? 'bg-navy-100' : 'group-hover:bg-slate-100'}
                `}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-navy-800' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {active && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500" />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
