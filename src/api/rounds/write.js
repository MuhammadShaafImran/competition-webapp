import supabase from "../supabaseClient"

export const createRound = async (tournamentId, roundNumber, isBreak = false) => {
  const { data: round, error } = await supabase
    .from("rounds")
    .insert([{
      number: roundNumber,
      is_break_round: isBreak,
      tournament_id: tournamentId,
      is_closing_round: false
    }])
    .select()
    .single()

  if (error) throw error
  return round
}

export const finalizeRound = async (roundId) => {
  const { error } = await supabase
    .from("matches")
    .update({ is_completed: true })
    .eq("round_id", roundId)

  if (error) throw error

  return { success: true }
}
