import supabase from "../supabaseClient"

export const getRoundsByTournament = async (tournamentId) => {
  // Get all matches grouped by round
  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      round_number,
      is_break,
      is_closing,
      status,
      created_at
    `)
    .eq("tournament_id", tournamentId)
    .order("round_number", { ascending: true })

  if (error) throw error

  // Group matches by round
  const rounds = {}
  data.forEach((match) => {
    if (!rounds[match.round_number]) {
      rounds[match.round_number] = {
        round_number: match.round_number,
        is_break: match.is_break,
        matches: [],
        status: match.status,
      }
    }
    rounds[match.round_number].matches.push(match)
  })

  return Object.values(rounds)
}

export const getCurrentRound = async (tournamentId) => {
  const { data, error } = await supabase.from("tournaments").select("current_round").eq("id", tournamentId).single()

  if (error) throw error
  return data.current_round
}
