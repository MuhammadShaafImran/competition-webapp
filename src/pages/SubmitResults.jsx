"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getMatchById } from "../api/matches/query"
import { submitMatchResults } from "../api/matches/write"
import { calculateTeamPoints, scaleRawPoints } from "../api/matches/service"

const SubmitResults = () => {
  const [match, setMatch] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { id, matchId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchData = await getMatchById(matchId)
        setMatch(matchData)

        // Initialize results from match data
        if (matchData.match_teams) {
          const initialResults = matchData.match_teams.map((mt) => ({
            match_team_id: mt.id,
            team_id: mt.team_id,
            team_name: mt.team?.name,
            role: mt.role,
            rank: mt.rank || null,
            raw_points: mt.raw_points || null,
            scaled_points: mt.scaled_points || null,
            team_points: mt.team_points || null,
          }))

          setResults(initialResults)
        }
      } catch (err) {
        console.error("Error fetching match:", err)
        setError("Failed to load match data")
      } finally {
        setLoading(false)
      }
    }

    fetchMatch()
  }, [matchId])

  const handleRankChange = (teamId, rank) => {
    const updatedResults = results.map((result) => {
      if (result.team_id === teamId) {
        const teamPoints = calculateTeamPoints(rank)
        return { ...result, rank, team_points: teamPoints }
      }
      return result
    })

    setResults(updatedResults)
  }

  const handlePointsChange = (teamId, rawPoints) => {
    // Update this team's raw points
    const updatedResults = results.map((result) => {
      if (result.team_id === teamId) {
        return { ...result, raw_points: rawPoints }
      }
      return result
    })

    // Calculate scaled points for all teams
    const resultsWithScaledPoints = updatedResults.map((result) => {
      const scaled = result.raw_points !== null ? scaleRawPoints(result.raw_points) : null

      return { ...result, scaled_points: scaled }
    })

    setResults(resultsWithScaledPoints)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate results
    const missingRanks = results.some((r) => r.rank === null)
    const missingPoints = results.some((r) => r.raw_points === null)

    if (missingRanks || missingPoints) {
      setError("Please complete all rankings and speaker points")
      return
    }

    setSubmitting(true)

    try {
      await submitMatchResults(matchId, results)
      navigate(`/tournaments/${id}/rounds`)
    } catch (err) {
      console.error("Error submitting results:", err)
      setError(err.message || "Failed to submit results")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading match data...</div>
  }

  if (!match) {
    return <div className="text-center py-8">Match not found</div>
  }

  const isCompleted = match.status === "completed"

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Submit Match Results</h1>
      <p className="text-gray-600 mb-6">
        Round {match.round_number}, Match #{match.id.slice(0, 8)}
      </p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Team Rankings</h2>
            <p className="text-sm text-gray-600 mb-4">Rank teams from 1 (first place) to 4 (fourth place)</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result) => (
                <div key={result.team_id} className="p-4 border border-gray-200 rounded">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">{result.team_name}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{result.role}</span>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rank (1-4)</label>
                    <select
                      value={result.rank || ""}
                      onChange={(e) => handleRankChange(result.team_id, Number(e.target.value))}
                      disabled={isCompleted}
                      className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                    >
                      <option value="">Select Rank</option>
                      <option value="1">1st (3 points)</option>
                      <option value="2">2nd (2 points)</option>
                      <option value="3">3rd (1 point)</option>
                      <option value="4">4th (0 points)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speaker Points (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={result.raw_points || ""}
                      onChange={(e) => handlePointsChange(result.team_id, Number(e.target.value))}
                      disabled={isCompleted}
                      className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                    />
                  </div>

                  {result.scaled_points !== null && (
                    <div className="mt-2 text-sm text-gray-600">Scaled Points: {result.scaled_points.toFixed(2)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/tournaments/${id}/rounds`)}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>

            {!isCompleted && (
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Results"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubmitResults
