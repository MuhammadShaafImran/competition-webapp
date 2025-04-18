"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getTournamentById } from "../api/tournaments/query"
import { getTeamStandings } from "../api/standings/query"

const ViewStatistics = () => {
  const [tournament, setTournament] = useState(null)
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { id } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentData = await getTournamentById(id)
        setTournament(tournamentData)

        const standingsData = await getTeamStandings(id)
        setStandings(standingsData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load tournament data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return <div className="text-center py-8">Loading tournament data...</div>
  }

  if (!tournament) {
    return <div className="text-center py-8">Tournament not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{tournament.name}</h1>
      <p className="text-gray-600 mb-6">Tournament Statistics</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Team Standings</h2>

        {standings.length === 0 ? (
          <p className="text-gray-500">No team data available yet</p>
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    1st Places
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    2nd Places
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Avg. Rank
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {standings.map((team, index) => (
                  <tr key={team.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.totalTeamPoints}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {team.totalSpeakerPoints ? team.totalSpeakerPoints.toFixed(2) : 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.firstPlaces}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.secondPlaces}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {team.averageRank ? team.averageRank.toFixed(2) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <Link to={`/tournaments/${id}/teams/${team.id}`}>View Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Tournament Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Teams</h3>
              <p className="text-2xl font-bold">{tournament.total_teams || 0}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Current Round</h3>
              <p className="text-2xl font-bold">
                {tournament.current_round || 0} / {tournament.rounds}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Status</h3>
              <p className="text-2xl font-bold capitalize">{tournament.status}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            to={`/tournaments/${id}/finalize`}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Finalize Tournament
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ViewStatistics
