"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"
import { createTournament } from "../api/tournaments/write"
import { validateTournamentInput } from "../api/tournaments/service"
import { createAdjudicator } from "../api/adjudicators/write"
import Papa from "papaparse"

const CreateTournament = () => {
  const [formData, setFormData] = useState({
    name: "",
    num_teams: 4,
    num_rounds: 1,
    break_rounds: 0, // Number of teams that break
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [breakStages, setBreakStages] = useState([]) // For display purposes only
  const [formSubmitted, setFormSubmitted] = useState(false) // Track form submission for animations
  const [adjudicators, setAdjudicators] = useState([])
  const [newAdjudicator, setNewAdjudicator] = useState({
    name: "",
    email: "",
    role: "experienced",
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [success, setSuccess] = useState(null)

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
    if (count >= 4) stages.push("finals")
    if (count >= 8) stages.push("semifinals")
    if (count >= 16) stages.push("quarterfinals")
    if (count >= 32) stages.push("octofinals")
    if (count >= 64) stages.push("double-octofinals")
    
    return stages.reverse() // Order from earliest to latest stage
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
    if (!newAdjudicator.name || !newAdjudicator.email || !newAdjudicator.role) {
      setErrors({ adjudicator: "All fields are required" })
      return
    }

    try {
      const newAdj = await createAdjudicator({
        ...newAdjudicator,
        tournament_id: tournamentId,
      })
      setAdjudicators((prev) => [...prev, newAdj])
      setNewAdjudicator({ name: "", email: "", role: "experienced" })
      setShowAddForm(false)
      setSuccess("Adjudicator added successfully")
    } catch (err) {
      setErrors({ adjudicator: "Failed to add adjudicator" })
      console.error("Error adding adjudicator:", err)
    }
  }

  const handleDeleteAdjudicator = (id) => {
    setAdjudicators((prev) => prev.filter((adj) => adj.id !== id))
    setSuccess("Adjudicator removed successfully")
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validAdjudicators = results.data
          .filter((row) => row.name && row.email && row.level)
          .map((row) => ({
            ...row,
            tournament_id: tournamentId,
          }))
        
        if (validAdjudicators.length === 0) {
          setErrors({ adjudicator: "No valid adjudicators found in the CSV file" })
          return
        }

        setAdjudicators((prev) => [...prev, ...validAdjudicators])
        setSuccess(`${validAdjudicators.length} adjudicators imported successfully`)
      },
      error: (error) => {
        setErrors({ adjudicator: "Error parsing CSV file: " + error.message })
      },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitted(true) // Trigger submission animation
    
    // Convert data to proper types
    const processedData = {
      ...formData,
      num_teams: parseInt(formData.num_teams, 10),
      num_rounds: parseInt(formData.num_rounds, 10),
      break_rounds: parseInt(formData.break_rounds, 10),
    }

    console.log("Form data before validation:", processedData)
    // Validate input
    const validation = validateTournamentInput(processedData)
    console.log("Validation result:", validation)

    if (!validation.isValid) {
      setErrors(validation.errors)
      setFormSubmitted(false)
      return
    }

    setLoading(true)

    try {
      const tournamentData = {
        ...processedData,
        created_by_admin_id: user.id,
        is_final_result_uploaded: false,
      }

      console.log("Creating tournament with data:", tournamentData)
      const newTournament = await createTournament(tournamentData)
      
      // Navigate to adjudicator assignment page
      navigate(`/tournaments/${newTournament.id}/adjudicators`)
      
    } catch (err) {
      console.error("Error creating tournament:", err)
      setErrors({ submit: err.message || "Failed to create tournament" })
      setFormSubmitted(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg p-6 shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <span className="transform transition-all duration-500 hover:scale-105">Create New Tournament</span>
          <svg className="ml-2 h-8 w-8 text-yellow-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </h1>
        <p className="text-blue-100 mt-2 opacity-90 hover:opacity-100 transition-opacity duration-300">Set up your tournament details below</p>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded shadow animate-bounce">
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

      <form onSubmit={handleSubmit} className={`bg-white rounded-b-lg shadow-lg p-8 transition-all duration-500 ${formSubmitted ? 'scale-95 opacity-80' : ''}`}>
        <div className="mb-6 transform transition duration-300 hover:translate-y-[-2px]">
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
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-blue-400"}`}
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
          <div className="transform transition duration-300 hover:translate-y-[-2px]">
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
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 ${errors.num_rounds ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-blue-400"}`}
              />
              <div className="absolute inset-y-0 right-[22px] flex items-center pr-3 pointer-events-none">
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

          <div className="transform transition duration-300 hover:translate-y-[-2px]">
            <label htmlFor="num_teams" className="block text-sm font-medium text-gray-700 mb-2">
              Total Number of Teams
            </label>
            <div className="relative">
              <input
                type="number"
                id="num_teams"
                name="num_teams"
                min="4"
                placeholder="Enter team count"
                value={formData.num_teams}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 ${errors.num_teams ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-blue-400"}`}
              />
              <div className="absolute inset-y-0 right-[22px] flex items-center pr-3 pointer-events-none">
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

        <div className="mb-8 transform transition duration-300 hover:translate-y-[-2px]">
          <label htmlFor="break_rounds" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Breaking Teams
          </label>
          <div className="relative">
            <select
              id="break_rounds"
              name="break_rounds"
              value={formData.break_rounds}
              onChange={handleBreakRoundChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 appearance-none pr-10 hover:border-blue-400"
            >
              <option value="32">Octofinals (32 teams)</option>
              <option value="16">Quarterfinals (16 teams)</option>
              <option value="8">Semifinals (8 teams)</option>
              <option value="4">Finals only (4 teams)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          {formData.break_rounds > 0 && (
            <div className="mt-3 bg-blue-50 p-3 rounded-lg transform transition duration-300 hover:shadow-md">
              <p className="text-sm text-blue-700 font-medium flex items-center">
                <svg className="h-4 w-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Break Stages:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {breakStages.map((stage, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded transform transition-all duration-300 hover:scale-105 hover:bg-blue-200">
                    {stage}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white transition-all duration-300 hover:bg-gray-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transform hover:-translate-y-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create Tournament"}
          </button>
        </div>
      </form>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-lg shadow-sm transform transition duration-300 hover:shadow">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Tournament Creation Tips</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Set up your preliminary rounds first, then consider how many teams should break</li>
                <li>Most tournaments have between 3-5 preliminary rounds</li>
                <li>You can always adjust tournament settings later</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTournament