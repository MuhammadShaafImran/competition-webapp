"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getTournamentById } from "../api/tournaments/query"
import { getRoundsByTournament, getCurrentRound } from "../api/rounds/query"
import { createRound } from "../api/rounds/write"
import { generateRound } from "../api/rounds/service"
import { getMatchesByRound } from "../api/matches/query"

const ManageRounds = () => {
  const [tournament, setTournament] = useState(null)
  const [rounds, setRounds] = useState([])
  const [currentRound, setCurrentRound] = useState(0)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRound, setSelectedRound] = useState(null)

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentData = await getTournamentById(id)
        setTournament(tournamentData)

        const roundsData = await getRoundsByTournament(id)
        setRounds(roundsData)

        const currentRoundData = await getCurrentRound(id)
        setCurrentRound(currentRoundData)

        // If there are rounds, select the current one
        if (roundsData.length > 0) {
          const roundToSelect = currentRoundData || roundsData[roundsData.length - 1].round_number
          setSelectedRound(roundToSelect)

          // Fetch matches for the selected round
          const matchesData = await getMatchesByRound(id, roundToSelect)
          setMatches(matchesData)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load tournament data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleCreateRound = async () => {
    try {
      const nextRound = currentRound + 1

      // Check if we've reached the maximum number of rounds
      if (nextRound > tournament.rounds) {
        setError("Maximum number of rounds reached")
        return
      }

      // Create the round
      await createRound(id, nextRound)

      // Generate matches for the round
      await generateRound(id, nextRound)

      // Refresh data
      const roundsData = await getRoundsByTournament(id)
      setRounds(roundsData)

      const currentRoundData = await getCurrentRound(id)
      setCurrentRound(currentRoundData)

      setSelectedRound(nextRound)

      // Fetch matches for the new round
      const matchesData = await getMatchesByRound(id, nextRound)
      setMatches(matchesData)
    } catch (err) {
      console.error("Error creating round:", err)
      setError(err.message || "Failed to create round")
    }
  }

  const handleSelectRound = async (roundNumber) => {
    setSelectedRound(roundNumber)

    try {
      const matchesData = await getMatchesByRound(id, roundNumber)
      setMatches(matchesData)
    } catch (err) {
      console.error("Error fetching matches:", err)
      setError("Failed to load matches")
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
      <p className="text-gray-600 mb-6">Manage Rounds</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rounds List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Rounds</h2>
            <button
              onClick={handleCreateRound}
              disabled={currentRound >= tournament.rounds}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Create Next Round
            </button>
          </div>

          {rounds.length === 0 ? (
            <p className="text-gray-500">No rounds created yet</p>
          ) : (
            <div className="space-y-2">
              {rounds.map((round) => (
                <button
                  key={round.round_number}
                  onClick={() => handleSelectRound(round.round_number)}
                  className={`w-full text-left p-3 rounded ${
                    selectedRound === round.round_number
                      ? "bg-blue-100 border border-blue-300"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Round {round.round_number}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        round.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {round.status === "completed" ? "Completed" : "In Progress"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{round.is_break ? "Break Round" : "Preliminary Round"}</div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Current Round: {currentRound || "None"} / {tournament.rounds}
            </p>
            <p className="text-sm text-gray-600">Teams: {tournament.total_teams || 0}</p>
          </div>
        </div>

        {/* Matches for Selected Round */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedRound ? `Round ${selectedRound} Matches` : "Select a Round"}
          </h2>

          {selectedRound ? (
            matches.length > 0 ? (
              <div className="space-y-6">
                {matches.map((match) => (
                  <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Match #{match.id.slice(0, 8)}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          match.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {match.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {match.match_teams &&
                        match.match_teams.map((matchTeam) => (
                          <div key={matchTeam.id} className="p-2 bg-gray-50 rounded">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{matchTeam.team?.name}</span>
                              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {matchTeam.role}
                              </span>
                            </div>

                            {matchTeam.rank && (
                              <div className="text-sm">
                                <span className="text-gray-600">Rank:</span> {matchTeam.rank}
                                {matchTeam.team_points !== null && (
                                  <span className="ml-2">({matchTeam.team_points} points)</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Adjudicators:</h4>
                        {match.match_adjudicators && match.match_adjudicators.length > 0 ? (
                          <ul className="text-sm text-gray-600">
                            {match.match_adjudicators.map((ma) => (
                              <li key={ma.id}>{ma.adjudicator?.name}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No adjudicators assigned</p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          to={`/tournaments/${id}/rounds/${selectedRound}/matches/${match.id}/results`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {match.status === "completed" ? "View Results" : "Enter Results"}
                        </Link>

                        {match.status !== "completed" && (
                          <Link
                            to={`/tournaments/${id}/rounds/${selectedRound}/adjudicators`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Assign Adjudicators
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No matches found for this round</p>
            )
          ) : (
            <p className="text-gray-500">Select a round to view matches</p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate(`/tournaments/${id}/statistics`)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              View Tournament Statistics
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageRounds
