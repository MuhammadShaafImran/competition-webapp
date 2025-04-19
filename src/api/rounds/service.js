import { getTeamsByTournament } from "../teams/query"
import { createMatch } from "../matches/write"
import { generatePairings } from "../../utils/pairingLogic"
import supabase from "../supabaseClient"

export const generateRound = async (tournamentId, roundNumber, isBreak = false) => {
  // Create round record first
  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .insert([{
      number: roundNumber,
      is_break_round: isBreak,
      tournament_id: tournamentId,
      is_closing_round: false
    }])
    .select()
    .single()

  if (roundError) throw roundError

  const teams = await getTeamsByTournament(tournamentId)
  const pairings = await generatePairings(teams, tournamentId, roundNumber, isBreak)

  const matches = []
  for (const pairing of pairings) {
    const match = await createMatch({
      tournament_id: tournamentId,
      round_id: round.id,
      team_1_id: pairing[0],
      team_2_id: pairing[1],
      team_3_id: pairing[2],
      team_4_id: pairing[3],
      is_break_round: isBreak
    })
    matches.push(match)
  }

  return matches
}

export const shouldCreateBreakRound = async (tournamentId) => {
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("num_rounds, break_rounds")
    .eq("id", tournamentId)
    .single()

  if (error) throw error

  const { data: rounds } = await supabase
    .from("rounds")
    .select("number")
    .eq("tournament_id", tournamentId)

  const completedRounds = rounds?.length || 0
  return completedRounds >= tournament.num_rounds
}
