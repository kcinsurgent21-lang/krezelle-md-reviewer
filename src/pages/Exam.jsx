import { Routes, Route, Navigate } from 'react-router-dom'
import ExamConfig from '../components/exam/ExamConfig'
import ExamEngine from '../components/exam/ExamEngine'
import ExamResults from '../components/exam/ExamResults'

export default function Exam() {
  return (
    <Routes>
      <Route index element={<ExamConfig />} />
      <Route path="active" element={<ExamEngine />} />
      <Route path="results" element={<ExamResults />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  )
}
