"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getMatchesByRound } from "../api/matches/query"
import { getAdjudicatorsByTournament } from "../api/adjudicators/query"
import { assignAdjudicators } from "../api/matches/write"
import { createAdjudicator, deleteAdjudicator } from "../api/adjudicators/write"
import { suggestAdjudicators, validateAdjudicatorInput } from "../api/adjudicators/service"

const AdjudicatorAssignment = () => {
  const [matches, setMatches] = useState([])
  const [adjudicators, setAdjudicators] = useState([])
  const [assignments, setAssignments] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAdjudicator, setNewAdjudicator] = useState({
    name: "",
    email: "",
    level: "experienced",
  })

  const { id, round } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesData, adjudicatorsData] = await Promise.all([
          getMatchesByRound(id, round),
          getAdjudicatorsByTournament(id),
        ])

        setMatches(matchesData)
        setAdjudicators(adjudicatorsData)

        // Initialize assignments from existing data
        const initialAssignments = {}
        matchesData.forEach((match) => {
          initialAssignments[match.id] = match.match_adjudicators
            ? match.match_adjudicators.map((ma) => ma.adjudicator.id)
            : []
        })

        setAssignments(initialAssignments)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, round])

  const handleAssignmentChange = (matchId, adjudicatorId, isChecked) => {
    setAssignments((prev) => {
      const current = prev[matchId] || []

      if (isChecked) {
        return { ...prev, [matchId]: [...current, adjudicatorId] }
      } else {
        return { ...prev, [matchId]: current.filter((id) => id !== adjudicatorId) }
      }
    })
  }

  const handleSaveAssignments = async (matchId) => {
    try {
      await assignAdjudicators(matchId, assignments[matchId] || [])

      // Refresh match data
      const matchesData = await getMatchesByRound(id, round)
      setMatches(matchesData)
    } catch (err) {
      console.error("Error saving assignments:", err)
      setError(err.message || "Failed to save assignments")
    }
  }

  const handleAddAdjudicator = async (e) => {
    e.preventDefault()

    // Validate input
    const validation = validateAdjudicatorInput(newAdjudicator)
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0])
      return
    }

    try {
      const adjudicatorData = {
        ...newAdjudicator,
        tournament_id: id,
      }

      await createAdjudicator(adjudicatorData)

      // Reset form
      setNewAdjudicator({
        name: "",
        email: "",
        level: "experienced",
      })

      setShowAddForm(false)

      // Refresh adjudicators list
      const adjudicatorsData = await getAdjudicatorsByTournament(id)
      setAdjudicators(adjudicatorsData)
    } catch (err) {
      console.error("Error adding adjudicator:", err)
      setError(err.message || "Failed to add adjudicator")
    }
  }

  const handleDeleteAdjudicator = async (adjudicatorId) => {
    if (!window.confirm("Are you sure you want to delete this adjudicator?")) {
      return
    }

    try {
      await deleteAdjudicator(adjudicatorId)

      // Refresh adjudicators list
      const adjudicatorsData = await getAdjudicatorsByTournament(id)
      setAdjudicators(adjudicatorsData)

      // Remove from assignments
      setAssignments((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((matchId) => {
          updated[matchId] = updated[matchId].filter((id) => id !== adjudicatorId)
        })
        return updated
      })
    } catch (err) {
      console.error("Error deleting adjudicator:", err)
      setError(err.message || "Failed to delete adjudicator")
    }
  }

  const handleSuggestAdjudicators = () => {
    // Simple suggestion algorithm
    const suggestions = suggestAdjudicators(matches, adjudicators)

    setAssignments((prev) => ({
      ...prev,
      ...suggestions,
    }))
  }

  if (loading) {
    return <div className="text-center py-8">Loading data...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Adjudicator Assignment</h1>
      <p className="text-gray-600 mb-6">Round {round}</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Adjudicators List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Adjudicators</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showAddForm ? "Cancel" : "Add New"}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddAdjudicator} className="mb-6 p-4 bg-gray-50 rounded">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newAdjudicator.name}
                  onChange={(e) => setNewAdjudicator({ ...newAdjudicator, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={newAdjudicator.email}
                  onChange={(e) => setNewAdjudicator({ ...newAdjudicator, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  value={newAdjudicator.level}
                  onChange={(e) => setNewAdjudicator({ ...newAdjudicator, level: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="novice">Novice</option>
                  <option value="experienced">Experienced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Add Adjudicator
              </button>
            </form>
          )}

          {adjudicators.length === 0 ? (
            <p className="text-gray-500">No adjudicators available</p>
          ) : (
            <div className="space-y-3">
              {adjudicators.map((adjudicator) => (
                <div
                  key={adjudicator.id}
                  className="p-3 border border-gray-200 rounded flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{adjudicator.name}</h3>
                    <div className="text-sm text-gray-600">
                      {adjudicator.email && <p>{adjudicator.email}</p>}
                      <p className="capitalize">{adjudicator.level}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAdjudicator(adjudicator.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {adjudicators.length > 0 && (
            <button
              onClick={handleSuggestAdjudicators}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Auto-Assign Adjudicators
            </button>
          )}
        </div>

        {/* Matches List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Matches</h2>

          {matches.length === 0 ? (
            <p className="text-gray-500">No matches found for this round</p>
          ) : (
            <div className="space-y-6">
              {matches.map((match) => (
                <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-3">Match #{match.id.slice(0, 8)}</h3>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {match.match_teams &&
                      match.match_teams.map((matchTeam) => (
                        <div key={matchTeam.id} className="p-2 bg-gray-50 rounded">
                          <div className="flex justify-between items-center">
                            <span>{matchTeam.team?.name}</span>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {matchTeam.role}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Assign Adjudicators:</h4>

                    {adjudicators.length === 0 ? (
                      <p className="text-gray-500 text-sm">No adjudicators available</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {adjudicators.map((adjudicator) => (
                          <label key={adjudicator.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={(assignments[match.id] || []).includes(adjudicator.id)}
                              onChange={(e) => handleAssignmentChange(match.id, adjudicator.id, e.target.checked)}
                              className="rounded text-blue-600"
                            />
                            <span className="text-sm">{adjudicator.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSaveAssignments(match.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Save Assignments
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate(`/tournaments/${id}/rounds`)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Rounds
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdjudicatorAssignment
