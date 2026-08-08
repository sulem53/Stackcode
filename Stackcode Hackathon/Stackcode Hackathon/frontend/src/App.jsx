// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import UploadPage from './pages/UploadPage'
import ResultsPage from './pages/ResultsPage'
import TrackerPage from './pages/TrackerPage'

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
