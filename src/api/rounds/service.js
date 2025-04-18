import { getTeamsByTournament } from "../teams/query"
import { createMatch } from "../matches/write"
import { generatePairings } from "../../utils/pairingLogic"

export const generateRound = async (tournamentId, roundNumber, isBreak = false) => {
  // Get all teams for this tournament
  const teams = await getTeamsByTournament(tournamentId)

  // Generate pairings based on team performance
  const pairings = await generatePairings(teams, tournamentId, roundNumber, isBreak)

  // Create matches for each pairing
  const matches = []
  for (const pairing of pairings) {
    const match = await createMatch({
      tournament_id: tournamentId,
      round_number: roundNumber,
      is_break: isBreak,
      is_closing: false, // This would be set based on tournament structure
      status: "pending",
      teams: pairing,
    })
    matches.push(match)
  }

  return matches
}

export const shouldCreateBreakRound = (tournament, teams) => {
  // Check if we've reached the final preliminary round
  if (tournament.current_round >= tournament.rounds) {
    // Check if we have enough teams for a break round (multiple of 4)
    return teams.length >= 4 && teams.length % 4 === 0
  }
  return false
}
