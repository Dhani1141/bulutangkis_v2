import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import SetupPage from './pages/SetupPage'
import MatchPage from './pages/MatchPage'
import LeaderboardPage from './pages/LeaderboardPage'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<SetupPage />} />
        <Route path="/match" element={<MatchPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-900 relative overflow-hidden">
        {/* Ambient floating background blobs */}
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-blue/10 blur-[120px] animate-float" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-purple/10 blur-[120px] animate-float-delayed" />
          <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-accent-cyan/5 blur-[100px] animate-pulse-slow" />
        </div>

        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  )
}
