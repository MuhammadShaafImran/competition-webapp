"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import Papa from "papaparse"
import { getMatchesByRound } from "../api/matches/query"
import { getAdjudicatorsByTournament } from "../api/adjudicators/query"
import { assignAdjudicators } from "../api/matches/write"
import { createAdjudicator, deleteAdjudicator, importAdjudicatorsFromCSV } from "../api/adjudicators/write"
import { suggestAdjudicators, validateAdjudicatorInput } from "../api/adjudicators/service"

const AdjudicatorAssignment = () => {
  const { tournamentId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [adjudicators, setAdjudicators] = useState([])
  const [assignments, setAssignments] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAdjudicator, setNewAdjudicator] = useState({
    name: "",
    email: "",
    level: "experienced",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesData, adjudicatorsData] = await Promise.all([
          getMatchesByRound(tournamentId, "current"),
          getAdjudicatorsByTournament(tournamentId),
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
  }, [tournamentId])

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
      const matchesData = await getMatchesByRound(tournamentId, "current")
      setMatches(matchesData)
    } catch (err) {
      console.error("Error saving assignments:", err)
      setError(err.message || "Failed to save assignments")
    }
  }

  const handleAdjudicatorChange = (e) => {
    const { name, value } = e.target
    setNewAdjudicator((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddAdjudicator = async (e) => {
    e.preventDefault()
    if (!newAdjudicator.name || !newAdjudicator.email || !newAdjudicator.level) {
      setError("All fields are required")
      return
    }

    try {
      const newAdj = await createAdjudicator({
        ...newAdjudicator,
        tournament_id: tournamentId,
      })
      setAdjudicators((prev) => [...prev, newAdj])
      setNewAdjudicator({ name: "", email: "", level: "experienced" })
      setShowAddForm(false)
      setSuccess("Adjudicator added successfully")
    } catch (err) {
      setError("Failed to add adjudicator")
      console.error("Error adding adjudicator:", err)
    }
  }

  const handleDeleteAdjudicator = async (id) => {
    try {
      await deleteAdjudicator(id)
      setAdjudicators((prev) => prev.filter((adj) => adj.id !== id))
      setSuccess("Adjudicator removed successfully")
    } catch (err) {
      setError("Failed to remove adjudicator")
      console.error("Error removing adjudicator:", err)
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validAdjudicators = results.data
          .filter((row) => row.name && row.email && row.level)
          .map((row) => ({
            name: row.name.trim(),
            email: row.email.trim().toLowerCase(),
            level: row.level.trim().toLowerCase(),
            tournament_id: tournamentId,
          }))
        
        if (validAdjudicators.length === 0) {
          setError("No valid adjudicators found in the CSV file")
          return
        }

        try {
          const promises = validAdjudicators.map((adj) => createAdjudicator(adj))
          const newAdjudicators = await Promise.all(promises)
          setAdjudicators((prev) => [...prev, ...newAdjudicators])
          setSuccess(`${validAdjudicators.length} adjudicators imported successfully`)
        } catch (err) {
          setError("Failed to import adjudicators")
          console.error("Error importing adjudicators:", err)
        }
      },
      error: (error) => {
        setError("Error parsing CSV file: " + error.message)
      },
    })
  }

  const handleContinue = () => {
    navigate(`/tournaments/${tournamentId}/teams`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">Manage Adjudicators</h1>
        <p className="text-blue-100 mt-2">Add and manage adjudicators for your tournament</p>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side - Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">Add Adjudicators</h3>
            <div className="space-x-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer group relative"
              >
                Import CSV
                <div className="absolute hidden group-hover:block right-0 mt-2 w-96 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-10">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">CSV Format Requirements:</h3>
                  <div className="text-xs text-gray-600 space-y-3">
                    <p>Your CSV file should have the following columns:</p>
                    <ul className="list-disc pl-2 space-y-1">
                      <li><code className="bg-gray-100 px-1">name</code> - Adjudicator's full name</li>
                      <li><code className="bg-gray-100 px-1">email</code> - Valid email address</li>
                      <li><code className="bg-gray-100 px-1">level</code> - One of: novice, experienced, expert</li>
                    </ul>
                    <div>
                      <p className="font-medium mb-2">Example:</p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 border-b text-left">name</th>
                              <th className="px-3 py-2 border-b text-left">email</th>
                              <th className="px-3 py-2 border-b text-left">level</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-3 py-2 border-b">John Doe</td>
                              <td className="px-3 py-2 border-b">john@example.com</td>
                              <td className="px-3 py-2 border-b">experienced</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 border-b">Jane Smith</td>
                              <td className="px-3 py-2 border-b">jane@example.com</td>
                              <td className="px-3 py-2 border-b">expert</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">Mike Johnson</td>
                              <td className="px-3 py-2">mike@example.com</td>
                              <td className="px-3 py-2">novice</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </label>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {showAddForm ? "Cancel" : "Add New"}
              </button>
            </div>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddAdjudicator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newAdjudicator.name}
                  onChange={handleAdjudicatorChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newAdjudicator.email}
                  onChange={handleAdjudicatorChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  name="level"
                  value={newAdjudicator.level}
                  onChange={handleAdjudicatorChange}
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
        </div>

        {/* Right side - List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Added Adjudicators</h3>
          {adjudicators.length === 0 ? (
            <p className="text-gray-500">No adjudicators added yet</p>
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
                    type="button"
                    onClick={() => handleDeleteAdjudicator(adjudicator.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleContinue}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
        >
          Continue to Teams
        </button>
      </div>
    </div>
  )
}

export default AdjudicatorAssignment

