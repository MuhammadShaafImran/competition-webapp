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
        // console.log("Tournament Data:", tournamentData)
        
        try {
          const roundsData = await getRoundsByTournament(id)
          setRounds(roundsData)
          console.log("Rounds Data:", roundsData)

          try {
            const currentRoundData = await getCurrentRound(id)
            setCurrentRound(currentRoundData)
            console.log("Current Round Data:", currentRoundData)

            if (roundsData.length > 0) {
              const roundToSelect = currentRoundData || roundsData[0].number
              setSelectedRound(roundToSelect)
              console.log("round to select: ", roundToSelect)

              try {
                // const matchesData = await getMatchesByRound(roundsData[0].id)
                
                setMatches(roundsData[roundToSelect].matches)
                console.log("Matches Data:", roundsData[roundToSelect].matches)
              
              } catch (err) {
                setError("Failed to load match data")
              }
            }
          } catch (err) {
            console.error("Error fetching current round:", err)
            setError("Failed to load current round")
          }
        } catch (err) {
          console.error("Error fetching rounds:", err)
          setError("Failed to load rounds data")
        }
      } catch (err) {
        console.error("Error fetching tournament:", err)
        setError("Failed to load tournament data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleCreateRound = async () => {
    try {
      const nextRoundNumber = currentRound + 1

      if (nextRoundNumber > tournament.num_rounds) {
        setError("Maximum number of rounds reached")
        return
      }

      const newRound = await createRound(id, nextRoundNumber)

      await generateRound(id, nextRoundNumber, newRound.id)

      const roundsData = await getRoundsByTournament(tournament.id)
      setRounds(roundsData)

      const currentRoundData = await getCurrentRound(id)
      setCurrentRound(currentRoundData)
      console.log("Current round data : ",currentRoundData)

      setSelectedRound(newRound.id)

      // const matchesData = await getMatchesByRound(newRound.id)

      // setMatches(matchesData)
    } catch (err) {
      console.error("Error creating round:", err)
      setError(err.message || "Failed to create round")
    }
  }

  const handleSelectRound = async (roundId) => {
    setSelectedRound(roundId)

    try {
      // const matchesData = await getMatchesByRound(roundId)
      // setMatches(matchesData)
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
              disabled={currentRound >= tournament.num_rounds}
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
                  key={round.id}
                  onClick={() => handleSelectRound(round.id)}
                  className={`w-full text-left p-3 rounded ${
                    selectedRound === round.id
                      ? "bg-blue-100 border border-blue-300"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Round {round.number}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        false ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {round.is_completed ? "Completed" : "In Progress"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{round.is_break_round ? "Break Round" : "Preliminary Round"}</div>
                </button>
              ))}
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Current Round: {currentRound || "None"} / {tournament.num_rounds}
            </p>
          </div>
        </div>

        {/* Matches for Selected Round */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedRound ? `Round ${rounds.find(round => round.id === selectedRound)?.number} Matches` : "Select a Round"}
          </h2>

          {selectedRound ? (
            matches.length > 0 ? (
              <div className="space-y-6">
                {matches.map((match, count) => (
                  <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Match #{count+1}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          match.is_completed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {match.is_completed ? "Completed" : "Pending"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p>Team 1: {match.teams1?.name}</p>
                        <p>Team 2: {match.teams2?.name}</p>
                        <p>Team 3: {match.teams3?.name}</p>
                        <p>Team 4: {match.teams4?.name}</p>
                      </div>
                    </div>

                    <Link to={`/tournaments/${id}/matches/${match.id}`} className="text-blue-600 hover:underline">
                      View Match Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No matches found for this round.</p>
            )
          ) : (
            <p className="text-gray-500">Select a round to view matches.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageRounds
