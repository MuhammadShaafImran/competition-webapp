"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { createTournament } from "../api/tournaments/write"
import { validateTournamentInput } from "../api/tournaments/service"

const CreateTournament = () => {
  const [formData, setFormData] = useState({
    name: "",
    num_rounds: 3,
    break_rounds: 0, // Number of teams that break
    status: "draft",
    num_teams: 0,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [breakStages, setBreakStages] = useState([]) // For display purposes only

  const { user } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBreakRoundChange = (e) => {
    const value = parseInt(e.target.value, 10)
    setFormData((prev) => ({
      ...prev,
      break_rounds: value
    }))
    
    // Update break stages for display only
    setBreakStages(generateBreakStages(value))
  }

  // Generate break stages based on count - for display purposes only
  const generateBreakStages = (count) => {
    const stages = []
    
    // Common break patterns
    if (count >= 2) stages.push("finals")
    if (count >= 4) stages.push("semifinals")
    if (count >= 8) stages.push("quarterfinals")
    if (count >= 16) stages.push("octofinals")
    if (count >= 32) stages.push("double-octofinals")
    if (count >= 64) stages.push("triple-octofinals")
    
    return stages.reverse() // Order from earliest to latest stage
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate input
    const validation = validateTournamentInput(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)

    try {
      const tournamentData = {
        ...formData,
        created_by_admin_id: user.id,
        is_final_result_uploaded: false,

      }
      console.log("Creating tournament with data:", tournamentData)
      const newTournament = await createTournament(tournamentData)
      navigate(`/tournaments/${newTournament.id}/teams`)
    } catch (err) {
      console.error("Error creating tournament:", err)
      setErrors({ submit: err.message || "Failed to create tournament" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">Create New Tournament</h1>
        <p className="text-blue-100 mt-2">Set up your tournament details below</p>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded shadow">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{errors.submit}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-b-lg shadow-lg p-8">
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Tournament Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter tournament name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {errors.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="rounds" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Preliminary Rounds
            </label>
            <div className="relative">
              <input
                type="number"
                id="num_rounds"
                name="num_rounds"
                min="1"
                value={formData.num_rounds}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${errors.num_rounds ? "border-red-500 bg-red-50" : "border-gray-300"}`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500">rounds</span>
              </div>
            </div>
            {errors.num_rounds && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {errors.num_rounds}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="num_teams" className="block text-sm font-medium text-gray-700 mb-2">
              Total Number of Teams
            </label>
            <div className="relative">
              <input
                type="number"
                id="num_teams"
                name="num_teams"
                min="2"
                placeholder="Enter team count"
                value={formData.num_teams}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${errors.num_teams ? "border-red-500 bg-red-50" : "border-gray-300"}`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500">teams</span>
              </div>
            </div>
            {errors.num_teams && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {errors.num_teams}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="break_rounds" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Breaking Teams
          </label>
          <div className="relative">
            <select
              id="break_rounds"
              name="break_rounds"
              value={formData.break_rounds}
              onChange={handleBreakRoundChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition appearance-none pr-10"
            >
              <option value="0">No break rounds</option>
              <option value="2">Finals only (2 teams)</option>
              <option value="4">Semifinals (4 teams)</option>
              <option value="8">Quarterfinals (8 teams)</option>
              <option value="16">Octofinals (16 teams)</option>
              <option value="32">Double-octofinals (32 teams)</option>
              <option value="64">Triple-octofinals (64 teams)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          {formData.break_rounds > 0 && (
            <div className="mt-3 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Break Stages:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {breakStages.map((stage, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {stage}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Status</label>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.status === 'draft' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${formData.status === 'draft' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <span className="font-medium">Draft</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Save as draft to edit later</p>
            </div>
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.status === 'active' ? 'bg-green-50 border-green-500 ring-2 ring-green-500' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${formData.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="font-medium">Active</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Make tournament live immediately</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Tournament"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateTournament