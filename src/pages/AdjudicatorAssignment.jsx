"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { getAdjudicatorsByTournament } from "../api/adjudicators/query"
import { createAdjudicator, deleteAdjudicator} from "../api/adjudicators/write"
import { importAdjudicatorsFromCSV} from "../api/adjudicators/service"

const AdjudicatorAssignment = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [adjudicators, setAdjudicators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAdjudicator, setNewAdjudicator] = useState({
    name: "",
    email: "",
    role: "experienced",
  })
  
  // Check if this is a new tournament from state
  const isNewTournament = location.state?.isNewTournament;
  const warningMessage = location.state?.message;

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching adjudicators for tournament: ", id)
        const adjudicatorsData = await getAdjudicatorsByTournament(id)
        setAdjudicators(adjudicatorsData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleAdjudicatorChange = (e) => {
    const { name, value } = e.target
    setNewAdjudicator((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddAdjudicator = async (e) => {
    e.preventDefault()
    if (!newAdjudicator.name || !newAdjudicator.email || !newAdjudicator.role) {
      setError("All fields are required")
      return
    }

    try {
      const newAdj = await createAdjudicator({
        ...newAdjudicator,
        tournament_id: id,
      })

      console.log("Adding adjudicator: ", newAdj)

      setAdjudicators((prev) => [...prev, newAdj])
      setNewAdjudicator({ name: "", email: "", role: "experienced" })
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const newAdjudicators = await importAdjudicatorsFromCSV(file, id)
      setAdjudicators((prev) => [...prev, ...newAdjudicators])
      setSuccess(`${newAdjudicators.length} adjudicators imported successfully`)
    } catch (err) {
      setError(err.message || "Failed to import adjudicators")
      console.error("Error importing adjudicators:", err)
    }
  }

  const handleContinue = () => {
    if (adjudicators.length === 0) {
      setError("You must add at least one adjudicator before proceeding to add teams");
      return;
    }
    navigate(`/tournaments/${id}/teams`);
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

      {isNewTournament && warningMessage && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{warningMessage}</p>
            </div>
          </div>
        </div>
      )}

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
                      <li><code className="bg-gray-100 px-1">role</code> - One of: novice, experienced, expert</li>
                    </ul>
                    <div>
                      <p className="font-medium mb-2">Example:</p>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border border-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 border-b text-left">name</th>
                              <th className="px-3 py-2 border-b text-left">email</th>
                              <th className="px-3 py-2 border-b text-left">role</th>
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
                  name="role"
                  value={newAdjudicator.role}
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
                      <p className="capitalize">{adjudicator.role}</p>
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

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleContinue}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
            adjudicators.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Continue to Add Teams
        </button>
      </div>
    </div>
  )
}

export default AdjudicatorAssignment

