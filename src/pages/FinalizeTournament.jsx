"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTournamentById } from "../api/tournaments/query"
import { getTeamStandings } from "../api/standings/query"
import { finalizeTournament } from "../api/tournaments/write"
import { calculateBreakingTeams } from "../api/standings/service"

const FinalizeTournament = () => {
  const [tournament, setTournament] = useState(null)
  const [standings, setStandings] = useState([])
  const [breakingTeams, setBreakingTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentData = await getTournamentById(id)
        setTournament(tournamentData)

        const standingsData = await getTeamStandings(id)
        setStandings(standingsData)

        // Calculate breaking teams
        const breakCount = Math.floor(standingsData.length * 0.25)
        const breakCount4 = Math.floor(breakCount / 4) * 4 // Ensure multiple of 4
        const breaking = calculateBreakingTeams(standingsData, breakCount4)
        setBreakingTeams(breaking)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load tournament data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleFinalize = async () => {
    if (!window.confirm("Are you sure you want to finalize this tournament? This action cannot be undone.")) {
      return
    }

    setSubmitting(true)

    try {
      await finalizeTournament(id)
      navigate(`/tournaments/${id}/statistics`)
    } catch (err) {
      console.error("Error finalizing tournament:", err)
      setError(err.message || "Failed to finalize tournament")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading tournament data...</div>
  }

  if (!tournament) {
    return <div className="text-center py-8">Tournament not found</div>
  }

  const isCompleted = tournament.status === "completed"

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{tournament.name}</h1>
      <p className="text-gray-600 mb-6">Finalize Tournament</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Tournament Status</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Teams</h3>
              <p className="text-2xl font-bold">{tournament.total_teams || 0}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Rounds Completed</h3>
              <p className="text-2xl font-bold">
                {tournament.current_round || 0} / {tournament.rounds}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Status</h3>
              <p className={`text-2xl font-bold capitalize ${isCompleted ? "text-green-600" : "text-yellow-600"}`}>
                {tournament.status}
              </p>
            </div>
          </div>

          {!isCompleted && tournament.current_round < tournament.rounds && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-700">
                Warning: Not all preliminary rounds have been completed. It's recommended to complete all rounds before
                finalizing.
              </p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Breaking Teams</h2>

          {breakingTeams.length === 0 ? (
            <p className="text-gray-500">No breaking teams available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Rank
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Team
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Team Points
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Speaker Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {breakingTeams.map((team, index) => (
                    <tr key={team.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.totalTeamPoints}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {team.totalSpeakerPoints ? team.totalSpeakerPoints.toFixed(2) : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(`/tournaments/${id}/statistics`)}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Statistics
          </button>

          {!isCompleted && (
            <button
              type="button"
              onClick={handleFinalize}
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Finalizing..." : "Finalize Tournament"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FinalizeTournament
