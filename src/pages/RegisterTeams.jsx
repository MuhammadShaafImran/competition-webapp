import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTournamentById } from "../api/tournaments/query"
import { getTeamsByTournament } from "../api/teams/query"
import { createTeam, deleteTeam } from "../api/teams/write"
import { batchUploadTeams } from "../api/teams/service"

const RegisterTeams = () => {
  const [tournament, setTournament] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [teamName, setTeamName] = useState("")
  const [member1Name, setMember1Name] = useState("")
  const [member1Email, setMember1Email] = useState("")
  const [member2Name, setMember2Name] = useState("")
  const [member2Email, setMember2Email] = useState("")
  const [institute, setInstitute] = useState("")
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!teamName.trim()) {
      setError("Team name is required")
      return
    }

    try {
      await createTeam({
        name: teamName,
        member_1_name: member1Name,
        member_1_email: member1Email,
        member_2_name: member2Name,
        member_2_email: member2Email,
        institute: institute,
        tournament_id: id
      })

      // Reset form
      setTeamName("")
      setMember1Name("")
      setMember1Email("")
      setMember2Name("")
      setMember2Email("")
      setInstitute("")

      // Refresh teams list
      const teamsData = await getTeamsByTournament(id)
      setTeams(teamsData)
      setError(null)
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

      setCsvFile(null)
      const teamsData = await getTeamsByTournament(id)
      setTeams(teamsData)
      setError(null)
    } catch (err) {
      console.error("Error uploading teams:", err)
      setError(err.message || "Failed to upload teams")
    }
  }

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return

    try {
      await deleteTeam(teamId)
      const teamsData = await getTeamsByTournament(id)
      setTeams(teamsData)
    } catch (err) {
      console.error("Error deleting team:", err)
      setError(err.message || "Failed to delete team")
    }
  }

  const handleCopyLink = (token) => {
    const url = `${window.location.origin}/team/${token}`
    navigator.clipboard.writeText(url)
    alert("Team link copied to clipboard!")
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-pulse text-blue-600 font-medium">Loading tournament data...</div>
    </div>
  )
  
  if (!tournament) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-red-600 font-medium">Tournament not found</div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">{tournament.name}</h1>
        <p className="text-gray-600 mt-2">Team Registration</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Add Team Form */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Register New Team</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter team name"
                required
              />
            </div>

            <div>
              <label htmlFor="institute" className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
              <input
                type="text"
                id="institute"
                value={institute}
                onChange={(e) => setInstitute(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter institute name"
              />
            </div>

            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Members</h3>
              
              {/* Member 1 */}
              <div className="mb-5">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <h4 className="font-medium text-gray-700">First Member</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={member1Name}
                      onChange={(e) => setMember1Name(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={member1Email}
                      onChange={(e) => setMember1Email(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter email"
                    />
                  </div>
                </div>
              </div>

              {/* Member 2 */}
              <div>
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <h4 className="font-medium text-gray-700">Second Member</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={member2Name}
                      onChange={(e) => setMember2Name(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={member2Email}
                      onChange={(e) => setMember2Email(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter email"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:translate-y-[-1px]"
            >
              Register Team
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Bulk Upload</h2>

            <form onSubmit={handleCsvUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Format: team, institute, member1, member1-email, member2, member2-email
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200"
              >
                Upload Teams
              </button>
            </form>
          </div>
        </div>

        {/* Teams List - Modified for single line format */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Registered Teams</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium py-1 px-3 rounded-full">
              {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
            </span>
          </div>

          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <p className="text-center">No teams registered yet</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Institute
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Members
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-800">{team.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{team.institute || "-"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {team.member_1_name && (
                            <span>{team.member_1_name}{team.member_1_email && ` (${team.member_1_email})`}</span>
                          )}
                          {team.member_1_name && team.member_2_name && <span>, </span>}
                          {team.member_2_name && (
                            <span>{team.member_2_name}{team.member_2_email && ` (${team.member_2_email})`}</span>
                          )}
                          {!team.member_1_name && !team.member_2_name && <span>No members</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition"
                          title="Delete team"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => navigate(`/tournaments/${id}/rounds`)}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center"
            >
              Continue to Rounds
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterTeams