import supabase from "../supabaseClient"

export const getRoundsByTournament = async (tournamentId) => {
  const { data, error } = await supabase
    .from("rounds")
    .select(`
      id,
      number,
      is_break_round,
      is_closing_round,
      created_at,
      matches!inner(
        id,
        tournament_id,
        is_completed,
        created_at
      )
    `)
    .eq("tournament_id", tournamentId)
    .order("number", { ascending: true })

  if (error) throw error

  return data.map(round => ({
    ...round,
    matches: round.matches,
    status: round.matches.some(m => !m.is_completed) ? "pending" : "completed"
  }))
}

export const getCurrentRound = async (tournamentId) => {
  const { data, error } = await supabase
    .from("rounds")
    .select("number")
    .eq("tournament_id", tournamentId)
    .order("number", { ascending: false })
    .limit(1)
    .single()

  if (error) return 0 // No rounds created yet
  return data?.number || 0
}
