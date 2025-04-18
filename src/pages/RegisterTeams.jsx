"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTournamentById } from "../api/tournaments/query"
import { getTeamsByTournament } from "../api/teams/query"
import { createTeam, createTeamLink, deleteTeam } from "../api/teams/write"
import { batchUploadTeams } from "../api/teams/service"

const RegisterTeams = () => {
  const [tournament, setTournament] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [teamName, setTeamName] = useState("")
  const [members, setMembers] = useState([{ name: "", email: "" }])
  const [csvFile, setCsvFile] = useState(null)

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentData = await getTournamentById(id)
        setTournament(tournamentData)

        const teamsData = await getTeamsByTournament(id)
        setTeams(teamsData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load tournament data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleAddMember = () => {
    setMembers([...members, { name: "", email: "" }])
  }

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members]
    updatedMembers[index][field] = value
    setMembers(updatedMembers)
  }

  const handleRemoveMember = (index) => {
    const updatedMembers = [...members]
    updatedMembers.splice(index, 1)
    setMembers(updatedMembers)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!teamName.trim()) {
      setError("Team name is required")
      return
    }

    try {
      const newTeam = await createTeam(
        { name: teamName, tournament_id: id },
        members.filter((m) => m.name.trim()),
      )

      // Create team link
      await createTeamLink(newTeam.id, id)

      // Reset form
      setTeamName("")
      setMembers([{ name: "", email: "" }])

      // Refresh teams list
      const teamsData = await getTeamsByTournament(id)
      setTeams(teamsData)
    } catch (err) {
      console.error("Error creating team:", err)
      setError(err.message || "Failed to create team")
    }
  }

  const handleCsvUpload = async (e) => {
    e.preventDefault()

    if (!csvFile) {
      setError("Please select a CSV file")
      return
    }

    try {
      await batchUploadTeams(csvFile, id)

      // Reset form
      setCsvFile(null)

      // Refresh teams list
      const teamsData = await getTeamsByTournament(id)
      setTeams(teamsData)
    } catch (err) {
      console.error("Error uploading teams:", err)
      setError(err.message || "Failed to upload teams")
    }
  }

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) {
      return
    }

    try {
      await deleteTeam(teamId)

      // Refresh teams list
      const teamsData = await getTeamsByTournament(id)
      setTeams(teamsData)
    } catch (err) {
      console.error("Error deleting team:", err)
      setError(err.message || "Failed to delete team")
    }
  }

  const handleGenerateLink = async (teamId) => {
    try {
      const link = await createTeamLink(teamId, id)

      // Copy link to clipboard
      const linkUrl = `${window.location.origin}/team/${link.uuid}`
      navigator.clipboard.writeText(linkUrl)

      alert("Team link copied to clipboard!")
    } catch (err) {
      console.error("Error generating team link:", err)
      setError(err.message || "Failed to generate team link")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading tournament data...</div>
  }

  if (!tournament) {
    return <div className="text-center py-8">Tournament not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{tournament.name}</h1>
      <p className="text-gray-600 mb-6">Manage Teams</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Team Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Add Team</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <h3 className="text-lg font-medium mb-2">Team Members</h3>

            {members.map((member, index) => (
              <div key={index} className="mb-4 p-3 border border-gray-200 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Member {index + 1}</h4>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={handleAddMember} className="mb-4 text-blue-600 hover:text-blue-800">
              + Add Another Member
            </button>

            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Team
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Bulk Upload Teams</h2>

            <form onSubmit={handleCsvUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="mt-1 text-sm text-gray-500">CSV format: team_name, member_name, member_email</p>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Upload Teams
              </button>
            </form>
          </div>
        </div>

        {/* Teams List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Registered Teams</h2>

          {teams.length === 0 ? (
            <p className="text-gray-500">No teams registered yet</p>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="p-4 border border-gray-200 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{team.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGenerateLink(team.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Generate Link
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-medium text-gray-700 mb-1">Members:</h4>
                  <ul className="text-sm text-gray-600">
                    {team.team_members && team.team_members.length > 0 ? (
                      team.team_members.map((member) => (
                        <li key={member.id} className="mb-1">
                          {member.name} {member.email && `(${member.email})`}
                        </li>
                      ))
                    ) : (
                      <li>No members</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate(`/tournaments/${id}/rounds`)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Continue to Rounds
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterTeams
