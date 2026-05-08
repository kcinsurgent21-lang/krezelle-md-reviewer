import { useEffect, useRef } from 'react'
import useExamStore from '../store/useExamStore'

export const useExamTimer = () => {
  const { config, status, tickTimer } = useExamStore()
  const intervalRef = useRef(null)

  useEffect(() => {
    if (status === 'active' && config.timed) {
      intervalRef.current = setInterval(tickTimer, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [status, config.timed, tickTimer])
}

export const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default useExamTimer
