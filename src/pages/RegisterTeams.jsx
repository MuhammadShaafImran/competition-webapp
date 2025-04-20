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
  const [showWarning, setShowWarning] = useState(false)

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

  const handleContinueToRounds = () => {
    if (teams.length < 4) {
      setError("You must add at least 4 teams before proceeding to manage rounds");
      setShowWarning(true);
      return;
    }
    navigate(`/tournaments/${id}/rounds`);
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

      {showWarning && teams.length < 4 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded shadow-sm">
          <p className="font-medium">Warning</p>
          <p>You need at least 4 teams to create matches in a British Parliamentary debate format.</p>
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

        {/* Teams List */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Registered Teams</h2>
            <div className="flex space-x-2">
              <label
                htmlFor="csv-upload"
                className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 cursor-pointer flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                Import CSV
              </label>
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={handleCsvUpload}
                disabled={!csvFile}
                className={`py-2 px-4 font-medium rounded-lg transition duration-200 ${
                  csvFile
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Upload
              </button>
            </div>
          </div>

          {teams.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500">No teams registered yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{team.name}</h3>
                      {team.institute && <p className="text-sm text-gray-600">{team.institute}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopyLink(team.private_token)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Copy team access link"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete team"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-700"><span className="font-medium">Member 1:</span> {team.member_1_name}</p>
                      <p className="text-sm text-gray-500">{team.member_1_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700"><span className="font-medium">Member 2:</span> {team.member_2_name}</p>
                      <p className="text-sm text-gray-500">{team.member_2_email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Controls */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => navigate(`/tournaments/${id}/adjudicators`)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Back to Adjudicators
        </button>
        
        <button
          onClick={handleContinueToRounds}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
            teams.length < 4 ? 'opacity-50' : ''
          }`}
        >
          Continue to Manage Rounds
        </button>
      </div>
    </div>
  )
}

export default RegisterTeams