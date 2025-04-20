"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getMatchById } from "../api/matches/query"
import { submitMatchResults } from "../api/matches/write"
import { calculateTeamPoints } from "../api/matches/service"
import Papa from "papaparse"

const SubmitResults = () => {
  const [match, setMatch] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [csvFile, setCsvFile] = useState(null)
  const [showCsvUpload, setShowCsvUpload] = useState(false)

  const { id, matchId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const matchData = await getMatchById(matchId)
        setMatch(matchData)

        // Initialize results from match data
        if (matchData.match_roles) {
          const initialResults = matchData.match_roles.map((mr) => ({
            match_team_id: mr.id,
            team_id: mr.team_id,
            team_name: matchData.teams1?.id === mr.team_id ? matchData.teams1?.name :
                      matchData.teams2?.id === mr.team_id ? matchData.teams2?.name :
                      matchData.teams3?.id === mr.team_id ? matchData.teams3?.name :
                      matchData.teams4?.name,
            role: mr.og ? 'og' : mr.oo ? 'oo' : mr.cg ? 'cg' : 'co',
            rank: matchData.ranks?.find(r => r.team_id === mr.team_id)?.rank || null,
            raw_points: null,
            scaled_points: null,
            team_points: null,
            member_1_points: matchData.speaker_points?.find(sp => sp.team_id === mr.team_id)?.member_1_points || null,
            member_2_points: matchData.speaker_points?.find(sp => sp.team_id === mr.team_id)?.member_2_points || null
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
        const teamPoints = calculateTeamPoints(result.role, rank)
        return { ...result, rank, team_points: teamPoints }
      }
      return result
    })

    setResults(updatedResults)
  }

  const handlePointsChange = (teamId, memberNum, points) => {
    const updatedResults = results.map((result) => {
      if (result.team_id === teamId) {
        return { 
          ...result, 
          [memberNum === 1 ? 'member_1_points' : 'member_2_points']: points 
        }
      }
      return result
    })

    setResults(updatedResults)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate results
    const missingRanks = results.some((r) => r.rank === null)
    const missingSpeakerPoints = results.some((r) => 
      r.member_1_points === null || r.member_2_points === null
    )

    if (missingRanks || missingSpeakerPoints) {
      setError("Please complete all rankings and speaker points")
      return
    }

    setSubmitting(true)

    try {
      // Transform results to match the expected structure
      const transformedResults = results.map(result => ({
        ...result,
        og: result.role === 'og' ? 1 : 0,
        oo: result.role === 'oo' ? 1 : 0,
        cg: result.role === 'cg' ? 1 : 0,
        co: result.role === 'co' ? 1 : 0
      }))

      await submitMatchResults(matchId, transformedResults)
      setSuccess("Results submitted successfully")
      setTimeout(() => {
        navigate(`/tournaments/${id}/rounds`)
      }, 1500)
    } catch (err) {
      console.error("Error submitting results:", err)
      setError(err.message || "Failed to submit results")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCsvUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCsvFile(file)
  }

  const processAndSubmitCsv = async () => {
    if (!csvFile) {
      setError("Please select a CSV file")
      return
    }

    setSubmitting(true)

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        try {
          // Expected CSV format: team_id, rank, member_1_points, member_2_points
          const validRows = results.data.filter(row => 
            row.team_id && row.rank && row.member_1_points && row.member_2_points
          )

          if (validRows.length !== 4) {
            setError("CSV must contain exactly 4 valid team results")
            setSubmitting(false)
            return
          }

          // Map CSV data to match results format
          const processedResults = validRows.map(row => {
            // Find the original result to get role information
            const originalResult = results.find(r => r.team_id === row.team_id) || {}
            
            return {
              team_id: row.team_id,
              rank: parseInt(row.rank, 10),
              member_1_points: parseInt(row.member_1_points, 10),
              member_2_points: parseInt(row.member_2_points, 10),
              og: originalResult.role === 'og' ? 1 : 0,
              oo: originalResult.role === 'oo' ? 1 : 0,
              cg: originalResult.role === 'cg' ? 1 : 0,
              co: originalResult.role === 'co' ? 1 : 0
            }
          })

          await submitMatchResults(matchId, processedResults)
          setSuccess("Results uploaded and submitted successfully")
          setTimeout(() => {
            navigate(`/tournaments/${id}/rounds`)
          }, 1500)
        } catch (err) {
          console.error("Error processing CSV:", err)
          setError(err.message || "Failed to process the CSV file")
        } finally {
          setSubmitting(false)
        }
      },
      error: (error) => {
        setError("Error parsing CSV file: " + error.message)
        setSubmitting(false)
      }
    })
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
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Submit Results</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCsvUpload(false)}
            className={`px-3 py-1 rounded ${!showCsvUpload ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setShowCsvUpload(true)}
            className={`px-3 py-1 rounded ${showCsvUpload ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            CSV Upload
          </button>
        </div>
      </div>

      {showCsvUpload ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Upload Results CSV</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file with team results. Format: team_id, rank (1-4), member_1_points, member_2_points
            </p>
            
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <button
                onClick={processAndSubmitCsv}
                disabled={!csvFile || submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Upload & Submit"}
              </button>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
            <h4 className="font-medium mb-2">CSV Format Requirements</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              team_id,rank,member_1_points,member_2_points
              11111111-1111-1111-1111-111111111111,1,85,87
              22222222-2222-2222-2222-222222222222,2,80,82
              33333333-3333-3333-3333-333333333333,3,78,75
              44444444-4444-4444-4444-444444444444,4,70,72
            </pre>
          </div>
        </div>
      ) : (
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

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member 1 Speaker Points (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={result.member_1_points || ""}
                          onChange={(e) => handlePointsChange(result.team_id, 1, Number(e.target.value))}
                          disabled={isCompleted}
                          className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member 2 Speaker Points (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={result.member_2_points || ""}
                          onChange={(e) => handlePointsChange(result.team_id, 2, Number(e.target.value))}
                          disabled={isCompleted}
                          className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-100"
                        />
                      </div>
                    </div>
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
      )}
    </div>
  )
}

export default SubmitResults
