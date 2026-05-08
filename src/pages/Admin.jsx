import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminPanel from '../components/admin/AdminPanel'
import QuestionForm from '../components/admin/QuestionForm'
import BulkImport from '../components/admin/BulkImport'

function EditWrapper() {
  const { id } = useParams()
  return <QuestionForm editId={id} />
}

function ImportWrapper() {
  const navigate = useNavigate()
  return <BulkImport onDone={() => navigate('/admin')} />
}

export default function Admin() {
  return (
    <Routes>
      <Route index element={<AdminPanel />} />
      <Route path="add" element={<QuestionForm />} />
      <Route path="edit/:id" element={<EditWrapper />} />
      <Route path="import" element={<ImportWrapper />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  )
}
