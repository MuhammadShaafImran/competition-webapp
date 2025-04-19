"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTeamById } from "../api/teams/query"
// import { createTeamLink } from "../api/teams/write"

const TeamTracking = () => {
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [linkCopied, setLinkCopied] = useState(false)

  const { id, teamId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamData = await getTeamById(teamId)
        setTeam(teamData)
      } catch (err) {
        console.error("Error fetching team:", err)
        setError("Failed to load team data")
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [teamId])

  const handleGenerateLink = async () => {
    try {
      // const link = await createTeamLink(teamId, id)

      // Copy link to clipboard
      const linkUrl = `${window.location.origin}/team/${link.uuid}`
      navigator.clipboard.writeText(linkUrl)

      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 3000)
    } catch (err) {
      console.error("Error generating team link:", err)
      setError(err.message || "Failed to generate team link")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading team data...</div>
  }

  if (!team) {
    return <div className="text-center py-8">Team not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{team.name}</h1>
      <p className="text-gray-600 mb-6">Team Details</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {linkCopied && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Team link copied to clipboard!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Team Information</h2>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Members</h3>
            {team.team_members && team.team_members.length > 0 ? (
              <ul className="space-y-2">
                {team.team_members.map((member) => (
                  <li key={member.id} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{member.name}</div>
                    {member.email && <div className="text-sm text-gray-600">{member.email}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No members</p>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Role History</h3>
            {team.roles_tracker ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Opening Government (OG)</div>
                  <div className="text-xl font-bold">{team.roles_tracker.og_count}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Opening Opposition (OO)</div>
                  <div className="text-xl font-bold">{team.roles_tracker.oo_count}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Closing Government (CG)</div>
                  <div className="text-xl font-bold">{team.roles_tracker.cg_count}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">Closing Opposition (CO)</div>
                  <div className="text-xl font-bold">{team.roles_tracker.co_count}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No role history available</p>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleGenerateLink}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate Team Access Link
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Performance</h2>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Match History</h3>
            {/* This would require additional data fetching */}
            <p className="text-gray-500">Match history not available in this view</p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate(`/tournaments/${id}/teams`)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Teams
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamTracking
