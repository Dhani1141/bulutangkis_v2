import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import SetupPage from './pages/SetupPage'
import MatchPage from './pages/MatchPage'
import LeaderboardPage from './pages/LeaderboardPage'
import { ErrorBoundary } from './components/ErrorBoundary'

function AnimatedRoutes() {
  const location = useLocation()

  // NOTE: No route-level AnimatePresence mode="wait" here. Exit animations of a
  // page containing `layout`-animated children could hang, so the next page
  // never mounted (blank screen until refresh). Pages still animate on enter.
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<SetupPage />} />
      <Route path="/match" element={<MatchPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative overflow-hidden">
        {/* Ambient floating background blobs */}
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-blue/20 blur-[120px] animate-float" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-purple/20 blur-[120px] animate-float-delayed" />
          <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-accent-cyan/10 blur-[100px] animate-pulse-slow" />
        </div>

        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  )
}

