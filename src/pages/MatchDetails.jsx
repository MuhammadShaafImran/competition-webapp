"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getMatchById } from "../api/matches/query"
import { submitMatchResults } from "../api/matches/write"

const MatchDetails = () => {
  const [match, setMatch] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { id: tournamentId, matchId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const matchData = await getMatchById(matchId)
        setMatch(matchData)
        
        // Initialize results with team data
        const initialResults = []
        if (matchData.teams1) initialResults.push({
          team_id: matchData.teams1.id,
          team_name: matchData.teams1.name,
          role: "og",
          member_1_name: matchData.teams1.member_1_name,
          member_2_name: matchData.teams1.member_2_name,
          member_1_points: 0,
          member_2_points: 0,
          rank: null
        })
        if (matchData.teams2) initialResults.push({
          team_id: matchData.teams2.id,
          team_name: matchData.teams2.name,
          role: "oo",
          member_1_name: matchData.teams2.member_1_name,
          member_2_name: matchData.teams2.member_2_name,
          member_1_points: 0,
          member_2_points: 0,
          rank: null
        })
        if (matchData.teams3) initialResults.push({
          team_id: matchData.teams3.id,
          team_name: matchData.teams3.name,
          role: "cg",
          member_1_name: matchData.teams3.member_1_name,
          member_2_name: matchData.teams3.member_2_name,
          member_1_points: 0,
          member_2_points: 0,
          rank: null
        })
        if (matchData.teams4) initialResults.push({
          team_id: matchData.teams4.id,
          team_name: matchData.teams4.name,
          role: "co",
          member_1_name: matchData.teams4.member_1_name,
          member_2_name: matchData.teams4.member_2_name,
          member_1_points: 0,
          member_2_points: 0,
          rank: null
        })

        setResults(initialResults)
      } catch (err) {
        console.error("Error fetching match:", err)
        setError("Failed to load match data")
      } finally {
        setLoading(false)
      }
    }

    fetchMatchData()
  }, [matchId])

  const handleRankChange = (teamId, rank) => {
    setResults(prev => prev.map(result => 
      result.team_id === teamId ? { ...result, rank } : result
    ))
  }

  const handleSpeakerPointsChange = (teamId, speakerNum, points) => {
    setResults(prev => prev.map(result => 
      result.team_id === teamId 
        ? { 
            ...result, 
            [speakerNum === 1 ? 'member_1_points' : 'member_2_points']: points
          }
        : result
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all required fields
    const missingRanks = results.some(r => r.rank === null)
    const missingPoints = results.some(r => 
      r.member_1_points === 0 || r.member_2_points === 0
    )

    if (missingRanks || missingPoints) {
      setError("Please fill in all ranks and speaker points")
      return
    }

    setSubmitting(true)

    try {
      await submitMatchResults(matchId, results)
      navigate(`/tournaments/${tournamentId}/rounds`)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Match Details</h1>
      <p className="text-gray-600 mb-6">
        Round {match.rounds?.number || "Unknown"}
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {results.map((team) => (
              <div key={team.team_id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg">{team.team_name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {team.role}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Rank
                    </label>
                    <select
                      value={team.rank || ""}
                      onChange={(e) => handleRankChange(team.team_id, Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="">Select Rank</option>
                      <option value="1">1st Place (3 points)</option>
                      <option value="2">2nd Place (2 points)</option>
                      <option value="3">3rd Place (1 point)</option>
                      <option value="4">4th Place (0 points)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Speaker Points
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          {team.member_1_name || "Speaker 1"}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={team.member_1_points}
                          onChange={(e) => handleSpeakerPointsChange(team.team_id, 1, Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          {team.member_2_name || "Speaker 2"}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={team.member_2_points}
                          onChange={(e) => handleSpeakerPointsChange(team.team_id, 2, Number(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/tournaments/${tournamentId}/rounds`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Results"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MatchDetails