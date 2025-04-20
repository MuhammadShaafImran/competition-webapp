import { getTeamsByTournament } from "../teams/query"
import { createMatch } from "../matches/write"
import { generatePairings } from "../../utils/pairingLogic"
import supabase from "../supabaseClient"

export const generateRound = async (tournamentId, roundNumber, round_id,isBreak = false) => {
  // Create round record first
  const teams = await getTeamsByTournament(tournamentId)
  const pairings = await generatePairings(teams, tournamentId, roundNumber, isBreak)

  console.log("Teams:", teams)
  console.log("Pairings:", pairings)

  const matches_record = []
  for (const pairing of pairings) {
      const current_match = await createMatch({
        round_id: round_id,
        tournament_id: tournamentId,
        team_1_id: pairing[0]['id'],
        team_2_id: pairing[1]['id'],
        team_3_id: pairing[2]['id'],
        team_4_id: pairing[3]['id'],
        is_break_round: isBreak
      })

    matches_record.push(current_match)
  }

  return matches_record
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
