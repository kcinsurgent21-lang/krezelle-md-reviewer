import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import Home from './pages/Home'
import Exam from './pages/Exam'
import Flashcards from './pages/Flashcards'
import Admin from './pages/Admin'
import Settings from './pages/Settings'

function AppShell() {
  const { pathname } = useLocation()
  const isExamActive = pathname === '/exam/active'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-full overflow-x-hidden">
      {!isExamActive && <Header />}
      {isExamActive && <Header />}

      <main className="flex-1 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exam/*" element={<Exam />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
