import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Setup from './pages/Setup.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Setup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
