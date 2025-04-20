"use client"
import { Routes, Route } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import ProtectedRoute from "../components/ProtectedRoute"
import MainLayout from "../components/Layout/MainLayout"

// Pages
import Login from "../pages/Login"
import Dashboard from "../pages/Dashboard"
import CreateTournament from "../pages/CreateTournament"
import RegisterTeams from "../pages/RegisterTeams"
import ManageRounds from "../pages/ManageRounds"
import SubmitResults from "../pages/SubmitResults"
import ViewStatistics from "../pages/ViewStatistics"
import FinalizeTournament from "../pages/FinalizeTournament"
import AdjudicatorAssignment from "../pages/AdjudicatorAssignment"
import TeamTracking from "../pages/TeamTracking"
import ErrorPage from "../pages/ErrorPage"
import TeamView from "../pages/TeamView"
import MatchDetails from "../pages/MatchDetails"

const AppRoutes = () => {
  const { loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/team/:token" element={<TeamView />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournaments/create"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateTournament />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournaments/:id/teams"
        element={
          <ProtectedRoute>
            <MainLayout>
              <RegisterTeams />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournaments/:id/rounds"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ManageRounds />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournaments/:id/rounds/:round/matches/:matchId/results"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SubmitResults />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournaments/:id/matches/:matchId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MatchDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournaments/:id/statistics"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ViewStatistics />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournaments/:id/finalize"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FinalizeTournament />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournaments/:id/rounds/:round/adjudicators"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AdjudicatorAssignment />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tournaments/:id/teams/:teamId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TeamTracking />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}

export default AppRoutes
