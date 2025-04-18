"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { getTournamentsByAdmin } from "../api/tournaments/query"

const Dashboard = () => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { user } = useAuth()

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getTournamentsByAdmin(user.id)
        setTournaments(data)
      } catch (err) {
        console.error("Error fetching tournaments:", err)
        setError("Failed to load tournaments")
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [user])

  if (loading) {
    return <div className="text-center py-8">Loading tournaments...</div>
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Tournaments</h1>
        <Link to="/tournaments/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Create New Tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600">You haven't created any tournaments yet.</p>
          <Link
            to="/tournaments/create"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create Your First Tournament
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{tournament.name}</h2>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Teams: {tournament.total_teams || 0}</span>
                  <span>
                    Rounds: {tournament.current_round || 0}/{tournament.rounds}
                  </span>
                </div>

                <div className="mb-4">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      tournament.status === "active"
                        ? "bg-green-100 text-green-800"
                        : tournament.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {tournament.status === "active"
                      ? "Active"
                      : tournament.status === "completed"
                        ? "Completed"
                        : "Draft"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/tournaments/${tournament.id}/teams`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Manage Teams
                  </Link>
                  <Link
                    to={`/tournaments/${tournament.id}/rounds`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Manage Rounds
                  </Link>
                  <Link
                    to={`/tournaments/${tournament.id}/statistics`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Statistics
                  </Link>
                  {tournament.status !== "completed" && (
                    <Link
                      to={`/tournaments/${tournament.id}/finalize`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Finalize
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
