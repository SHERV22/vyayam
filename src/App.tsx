import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PrivateRoute } from './components/PrivateRoute'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ProgramDetailsPage } from './pages/ProgramDetailsPage'
import { ProgramsPage } from './pages/ProgramsPage'
import { ProgressPage } from './pages/ProgressPage'
import { RegisterPage } from './pages/RegisterPage'
import { WorkoutPage } from './pages/WorkoutPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:id" element={<ProgramDetailsPage />} />
        <Route path="/workout/:programId/:dayId" element={<WorkoutPage />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
