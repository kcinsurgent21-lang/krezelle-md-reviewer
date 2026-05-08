import { useEffect, useRef } from 'react'
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import useQuestionStore from '../../store/useQuestionStore'
import useFlashcardStore from '../../store/useFlashcardStore'
import { isConfigured } from '../../lib/supabase'

function fmt(ts) {
  if (!ts) return null
  const diff = Date.now() - ts
  if (diff < 60_000)  return 'just now'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`
  return `${Math.floor(diff / 3600_000)}h ago`
}

export default function SyncStatus() {
  const qSync  = useQuestionStore((s) => s.syncStatus)
  const fcSync = useFlashcardStore((s) => s.syncStatus)
  const qLast  = useQuestionStore((s) => s.lastSynced)
  const qErr   = useQuestionStore((s) => s.syncError)
  const fcErr  = useFlashcardStore((s) => s.syncError)

  const syncQ  = useQuestionStore((s) => s.sync)
  const syncFC = useFlashcardStore((s) => s.sync)

  // Auto-sync on mount when Supabase is configured
  const didMount = useRef(false)
  useEffect(() => {
    if (!isConfigured || didMount.current) return
    didMount.current = true
    syncQ()
    syncFC()
  }, []) // eslint-disable-line

  const handleSync = () => { syncQ(); syncFC() }

  const busy  = qSync === 'syncing' || fcSync === 'syncing'
  const error = qSync === 'error'   || fcSync === 'error'
  const synced = (qSync === 'synced' || qSync === 'idle') && (fcSync === 'synced' || fcSync === 'idle')

  if (!isConfigured) {
    return (
      <button
        title="Supabase not configured — add credentials in .env.local"
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-navy-400 hover:bg-white/10 transition-colors text-xs"
        onClick={() => window.open('https://supabase.com', '_blank')}
      >
        <CloudOff size={15} />
      </button>
    )
  }

  return (
    <button
      onClick={handleSync}
      disabled={busy}
      title={error ? `Sync error: ${qErr || fcErr}` : qLast ? `Last synced ${fmt(qLast)}` : 'Sync now'}
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors
        ${error ? 'text-red-400 hover:bg-red-500/20' :
          busy  ? 'text-navy-300 cursor-not-allowed' :
                  'text-teal-400 hover:bg-white/10'}
      `}
    >
      {busy ? (
        <RefreshCw size={14} className="animate-spin" />
      ) : error ? (
        <AlertCircle size={14} />
      ) : synced && qLast ? (
        <CheckCircle2 size={14} />
      ) : (
        <Cloud size={14} />
      )}
      <span className="hidden sm:inline">
        {busy ? 'Syncing…' : error ? 'Retry' : qLast ? fmt(qLast) : 'Sync'}
      </span>
    </button>
  )
}
