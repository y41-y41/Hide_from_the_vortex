import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainDashboard from './pages/MainDashboard.jsx'
import Setup from './pages/Setup.jsx'
import SOSPage from './pages/SOSPage.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"          element={<MainDashboard />} />
        <Route path="/profile"   element={<Setup />} />
        <Route path="/sos"       element={<SOSPage />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
