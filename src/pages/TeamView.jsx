"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getTeamByToken } from "../api/teams/query"

const TeamView = () => {
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { token } = useParams()

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamData = await getTeamByToken(token)
        setTeam(teamData)
      } catch (err) {
        console.error("Error fetching team:", err)
        setError("Invalid or expired team link")
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team data...</p>
        </div>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Error</h1>
          <p className="text-gray-600 mb-6">{error || "Team not found. The link may be invalid or expired."}</p>
        </div>
      </div>
    )
  }

  // Calculate role from match_roles data
  const getTeamRole = (matchRole) => {
    if (matchRole.og === 1) return 'og'
    if (matchRole.oo === 1) return 'oo'
    if (matchRole.cg === 1) return 'cg'
    if (matchRole.co === 1) return 'co'
    return 'Unknown'
  }

  // Calculate rank from role
  const getRankFromRole = (matchRole) => {
    if (matchRole.og === 1) return 1
    if (matchRole.oo === 1) return 2
    if (matchRole.cg === 1) return 3
    if (matchRole.co === 1) return 4
    return null
  }

  // Group matches by round
  const matchesByRound = {}
  team.match_roles.forEach((matchRole) => {
    const roundNumber = matchRole.match?.round_number
    if (!matchesByRound[roundNumber]) {
      matchesByRound[roundNumber] = []
    }
    matchesByRound[roundNumber].push({
      ...matchRole,
      role: getTeamRole(matchRole),
      rank: getRankFromRole(matchRole)
    })
  })

  // Calculate total points
  const totalTeamPoints = team.match_roles.reduce((sum, mr) => {
    if (mr.og === 1) return sum + 3
    if (mr.oo === 1) return sum + 2
    if (mr.cg === 1) return sum + 1
    return sum
  }, 0)

  const totalSpeakerPoints = team.match_roles.reduce((sum, mr) => sum + (mr.scaled_points || 0), 0)

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{team.name}</h1>
            <p className="text-gray-600 mb-4">Tournament: {team.tournament?.name}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium mb-1">Team Points</h3>
                <p className="text-2xl font-bold">{totalTeamPoints}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium mb-1">Speaker Points</h3>
                <p className="text-2xl font-bold">{totalSpeakerPoints.toFixed(2)}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium mb-1">Tournament Status</h3>
                <p className="text-2xl font-bold capitalize">{team.tournament?.status}</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Team Members</h2>
              {team.team_members && team.team_members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {team.team_members.map((member) => (
                    <div key={member.id} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">{member.name}</div>
                      {member.email && <div className="text-sm text-gray-600">{member.email}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No members listed</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Match Results</h2>

            {Object.keys(matchesByRound).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(matchesByRound)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([round, matches]) => (
                    <div key={round} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium mb-3">
                        Round {round} {matches[0].match.is_break ? "(Break Round)" : ""}
                      </h3>

                      <div className="space-y-3">
                        {matches.map((matchRole) => (
                          <div key={matchRole.id} className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Role: {matchRole.role}</span>
                              {matchRole.rank && (
                                <span
                                  className={`text-sm px-2 py-1 rounded ${
                                    matchRole.rank === 1
                                      ? "bg-green-100 text-green-800"
                                      : matchRole.rank === 2
                                        ? "bg-blue-100 text-blue-800"
                                        : matchRole.rank === 3
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  Rank: {matchRole.rank}
                                </span>
                              )}
                            </div>

                            {matchRole.team_points !== null && (
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Team Points:</span> {matchRole.team_points}
                                </div>
                                <div>
                                  <span className="text-gray-600">Speaker Points:</span>{" "}
                                  {matchRole.scaled_points?.toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No match results available yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamView
