import supabase from "../supabaseClient"

export const createRound = async (tournamentId, roundNumber, isBreak = false) => {
  // First update the tournament's current round
  const { error: tournamentError } = await supabase
    .from("tournaments")
    .update({ current_round: roundNumber })
    .eq("id", tournamentId)

  if (tournamentError) throw tournamentError

  // The actual match creation will be handled by the matches service
  return { tournamentId, roundNumber, isBreak }
}

export const finalizeRound = async (tournamentId, roundNumber) => {
  // Update all matches in this round to 'completed'
  const { error } = await supabase
    .from("matches")
    .update({ status: "completed" })
    .eq("tournament_id", tournamentId)
    .eq("round_number", roundNumber)

  if (error) throw error

  return { success: true }
}
