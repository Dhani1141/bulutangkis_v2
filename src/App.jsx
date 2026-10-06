import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import SetupPage from './pages/SetupPage'
import MatchPage from './pages/MatchPage'
import LeaderboardPage from './pages/LeaderboardPage'
import History from './pages/History'
import { ErrorBoundary } from './components/ErrorBoundary'
import ThemeToggle from './components/ThemeToggle'
import GlassFilters from './components/GlassFilters'
import GlobalNavigation from './components/GlobalNavigation'

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
      <Route path="/history" element={<History />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative overflow-hidden">
        <GlobalNavigation />
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* SVG displacement filters for the liquid glass effect */}
        <GlassFilters />

        {/* Animated textured backdrop — the glass surfaces refract this */}
        <div className="liquid-bg" aria-hidden="true" />

        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  )
}

