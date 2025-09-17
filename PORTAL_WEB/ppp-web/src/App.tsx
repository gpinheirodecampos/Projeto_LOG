import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Pages
import LoginPage from './pages/login'
import DashboardPage from './pages/dashboard'
import DriversPage from './pages/drivers'

// Layout
import { MainLayout } from './components/layouts/main-layout'

// Contexts
import { AuthProvider, useAuth } from './contexts/auth-context'
import { ThemeProvider } from './contexts/theme-context'

// Protected Route component
interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Main App component
function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard - Default route */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="drivers" element={<DriversPage />} />
          
          {/* Placeholder routes for future pages */}
          <Route path="vehicles" element={<div className="p-6">Página de Veículos (Em breve)</div>} />
          <Route path="reports" element={<div className="p-6">Página de Relatórios (Em breve)</div>} />
          <Route path="settings" element={<div className="p-6">Página de Configurações (Em breve)</div>} />
        </Route>
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
