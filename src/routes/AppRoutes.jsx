"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import ProtectedRoute from "../components/ProtectedRoute"
import MainLayout from "../components/Layout/MainLayout"
import { FullscreenLoading } from "../components/LoadingSpinner"

// Pages
import Login from "../pages/Login"
import Register from "../pages/Register"
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

// Route definitions for better organization
const ROUTES = {
  // Public routes
  public: [
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/team/:token", element: <TeamView /> },
  ],
  
  // Protected routes that need authentication
  protected: [
    { path: "/", element: <Dashboard /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/tournaments/create", element: <CreateTournament /> },
    { path: "/tournaments/:id/teams", element: <RegisterTeams /> },
    { path: "/tournaments/:id/rounds", element: <ManageRounds /> },
    { path: "/tournaments/:id/rounds/:round/matches/:matchId/results", element: <SubmitResults /> },
    { path: "/tournaments/:id/statistics", element: <ViewStatistics /> },
    { path: "/tournaments/:id/finalize", element: <FinalizeTournament /> },
    { path: "/tournaments/:id/rounds/:round/adjudicators", element: <AdjudicatorAssignment /> },
    { path: "/tournaments/:id/adjudicators", element: <AdjudicatorAssignment /> },
    { path: "/tournaments/:id/tracking", element: <TeamTracking /> },
  ]
}

const AppRoutes = () => {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return <FullscreenLoading message="Loading application..." />
  }

  return (
    <Routes>
      {/* Redirect authenticated users away from auth pages */}
      {isAuthenticated && (
        <Route 
          path="/login" 
          element={<Navigate to="/dashboard" replace />} 
        />
      )}
      {isAuthenticated && (
        <Route 
          path="/register" 
          element={<Navigate to="/dashboard" replace />} 
        />
      )}

      {/* Public routes */}
      {ROUTES.public.map(route => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* Protected routes wrapped in MainLayout */}
      {ROUTES.protected.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              <MainLayout>
                {route.element}
              </MainLayout>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Catch-all route */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}

export default AppRoutes
