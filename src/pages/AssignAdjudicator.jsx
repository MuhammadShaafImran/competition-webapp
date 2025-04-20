import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAvailableAdjudicators } from "../api/adjudicators/query"
import { assignAdjudicatorsToMatch } from "../api/adjudicators/write"

const AssignAdjudicator = () => {
  const { id, matchId } = useParams()
  const navigate = useNavigate()
  const [adjudicators, setAdjudicators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [selectedAdjudicators, setSelectedAdjudicators] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching available adjudicators for match: ", matchId)
        const adjudicatorsData = await getAvailableAdjudicators(id, matchId)
        setAdjudicators(adjudicatorsData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, matchId])

  const handleAdjudicatorSelect = (adjudicatorId) => {
    setSelectedAdjudicators(prev => {
      if (prev.includes(adjudicatorId)) {
        return prev.filter(id => id !== adjudicatorId)
      } else {
        return [...prev, adjudicatorId]
      }
    })
  }

  const handleSubmit = async () => {
    if (selectedAdjudicators.length === 0) {
      setError("Please select at least one adjudicator")
      return
    }

    try {
      await assignAdjudicatorsToMatch(matchId, selectedAdjudicators)
      setSuccess("Adjudicators assigned successfully")
      setTimeout(() => {
        navigate(`/tournaments/${id}/rounds`)
      }, 1500)
    } catch (err) {
      setError("Failed to assign adjudicators")
      console.error("Error assigning adjudicators:", err)
    }
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
        <h1 className="text-3xl font-bold text-white">Assign Adjudicators</h1>
        <p className="text-blue-100 mt-2">Select adjudicators for this match</p>
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

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Available Adjudicators</h2>
          <span className="text-sm text-gray-600">
            {selectedAdjudicators.length} selected
          </span>
        </div>

        {adjudicators.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No adjudicators available</p>
        ) : (
          <div className="space-y-4">
            {adjudicators.map((adjudicator) => (
              <div
                key={adjudicator.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAdjudicators.includes(adjudicator.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => handleAdjudicatorSelect(adjudicator.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{adjudicator.name}</h3>
                    <div className="text-sm text-gray-600">
                      {adjudicator.email && <p>{adjudicator.email}</p>}
                      <p className="capitalize">{adjudicator.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedAdjudicators.includes(adjudicator.id)}
                      onChange={() => handleAdjudicatorSelect(adjudicator.id)}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => navigate(`/tournaments/${id}/rounds`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              selectedAdjudicators.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={selectedAdjudicators.length === 0}
          >
            Assign Selected
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssignAdjudicator 