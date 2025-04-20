"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getTournamentById } from "../api/tournaments/query"
import { getRoundsByTournament, getCurrentRound } from "../api/rounds/query"
import { createRound } from "../api/rounds/write"
import { generateRound } from "../api/rounds/service"
import { getMatchesByRound } from "../api/matches/query"
import { getAdjudicatorsByTournament } from "../api/adjudicators/query"

const ManageRounds = () => {
  const [tournament, setTournament] = useState(null)
  const [rounds, setRounds] = useState([])
  const [currentRound, setCurrentRound] = useState(0)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRound, setSelectedRound] = useState(null)
  const [adjudicators, setAdjudicators] = useState([])
  const [workflow, setWorkflow] = useState({
    adjudicatorsAssigned: false,
    matchesCreated: false
  })

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentData = await getTournamentById(id)
        setTournament(tournamentData)
        
        try {
          const roundsData = await getRoundsByTournament(id)
          setRounds(roundsData)
          console.log("Rounds Data:", roundsData)

          // Get adjudicators to check if there are any
          const adjudicatorsData = await getAdjudicatorsByTournament(id)
          setAdjudicators(adjudicatorsData)
          setWorkflow(prev => ({...prev, adjudicatorsAssigned: adjudicatorsData.length > 0}))

          try {
            const currentRoundData = await getCurrentRound(id)
            setCurrentRound(currentRoundData)
            console.log("Current Round Data:", currentRoundData)

            if (roundsData.length > 0) {
              const roundToSelect = currentRoundData || roundsData[0].number
              setSelectedRound(roundToSelect)
              console.log("round to select: ", roundToSelect)

              try {
                // Get matches for the selected round
                const selectedRound = roundsData.find(r => r.number === roundToSelect)
                if (!selectedRound) {
                  console.error("Selected round not found:", roundToSelect)
                  setError("Failed to find selected round")
                  return
                }
                console.log("Fetching matches for round:", selectedRound.id)
                const matchesData = await getMatchesByRound(selectedRound.id)
                console.log("Fetched matches:", matchesData)
                setMatches(matchesData)
                setWorkflow(prev => ({...prev, matchesCreated: matchesData.length > 0}))
              } catch (err) {
                console.error("Error fetching matches:", err)
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

      // Check if adjudicators are available
      if (adjudicators.length === 0) {
        setError("You must add adjudicators before creating a round")
        return
      }

      const newRound = await createRound(id, nextRoundNumber)

      await generateRound(id, nextRoundNumber, newRound.id)

      const roundsData = await getRoundsByTournament(tournament.id)
      setRounds(roundsData)

      const currentRoundData = await getCurrentRound(id)
      setCurrentRound(currentRoundData)
      console.log("Current round data : ", currentRoundData)

      setSelectedRound(newRound.id)

      // Update matches for the new round
      const newMatchesData = roundsData.find(r => r.id === newRound.id)?.matches || []
      setMatches(newMatchesData)
      setWorkflow(prev => ({...prev, matchesCreated: newMatchesData.length > 0}))
    } catch (err) {
      console.error("Error creating round:", err)
      setError(err.message || "Failed to create round")
    }
  }

  const handleSelectRound = async (roundId) => {
    setSelectedRound(roundId)

    try {
      // Get the round data including matches
      const roundData = rounds.find(r => r.id === roundId)
      const matchesData = roundData?.matches || []
      setMatches(matchesData)
      setWorkflow(prev => ({...prev, matchesCreated: matchesData.length > 0}))
    } catch (err) {
      console.error("Error fetching matches:", err)
      setError("Failed to load matches")
    }
  }

  // Helper to check if a match has adjudicators assigned
  const hasAdjudicatorsAssigned = (match) => {
    return match.adjudicators && match.adjudicators.length > 0
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

      {!workflow.adjudicatorsAssigned && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">You must add adjudicators before creating rounds</p>
              <p className="text-sm mt-1">
                <button 
                  onClick={() => navigate(`/tournaments/${id}/adjudicators`)}
                  className="underline hover:text-yellow-800"
                >
                  Go to adjudicator management
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rounds List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Rounds</h2>
            <button
              onClick={handleCreateRound}
              disabled={currentRound >= tournament.num_rounds || !workflow.adjudicatorsAssigned}
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
                        round.is_completed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
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
                        <p className="text-sm text-gray-700"><span className="font-medium">Team 1:</span> {match.teams1?.name}</p>
                        <p className="text-sm text-gray-700"><span className="font-medium">Team 2:</span> {match.teams2?.name}</p>
                        <p className="text-sm text-gray-700"><span className="font-medium">Team 3:</span> {match.teams3?.name}</p>
                        <p className="text-sm text-gray-700"><span className="font-medium">Team 4:</span> {match.teams4?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 font-medium">Adjudicators:</p>
                        {match.adjudicators && match.adjudicators.length > 0 ? (
                          <ul className="text-sm text-gray-600 space-y-1">
                            {match.adjudicators.map(adj => (
                              <li key={adj.id} className="flex items-center">
                                <span className="mr-2">{adj.name}</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {adj.role}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-red-500">
                            No adjudicators assigned
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link 
                        to={`/tournaments/${id}/matches/${match.id}/adjudicators`} 
                        className={`${!match.adjudicators?.length ? 'text-red-600 font-medium hover:underline' : 'text-blue-600 hover:underline'}`}
                      >
                        {!match.adjudicators?.length ? '⚠️ Assign Adjudicators' : 'Manage Adjudicators'}
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Link 
                        to={`/tournaments/${id}/matches/${match.id}`} 
                        className={`${hasAdjudicatorsAssigned(match) ? 'text-blue-600 hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
                        onClick={(e) => {
                          if (!hasAdjudicatorsAssigned(match)) {
                            e.preventDefault();
                            setError("You must assign at least one adjudicator to this match before submitting results");
                          }
                        }}
                      >
                        Submit Results
                      </Link>
                    </div>
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

      <div className="flex justify-between mt-8">
        <button
          onClick={() => navigate(`/tournaments/${id}/teams`)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Back to Teams
        </button>
      </div>
    </div>
  )
}

export default ManageRounds
