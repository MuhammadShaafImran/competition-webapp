import supabase from "../supabaseClient"

export const getMatchesByRound = async (tournamentId, roundNumber) => {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      tournament_id,
      round_number,
      is_break,
      status,
      venue,
      match_teams(
        id,
        team:teams(
          id,
          name,
          status
        ),
        team_points,
        raw_points,
        scaled_points,
        rank,
        role
      ),
      match_adjudicators(
        id,
        adjudicator:adjudicators(
          id,
          name,
          email,
          level
        )
      )
    `)
    .eq("tournament_id", tournamentId)
    .eq("round_number", roundNumber)
    .order("created_at")

  if (error) throw error
  return data
}

export const getMatchById = async (matchId) => {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      match_teams(
        id,
        team_id,
        role,
        team_points,
        scaled_points,
        raw_points,
        rank,
        team:teams(
          id,
          name,
          team_members(*)
        )
      ),
      match_adjudicators(
        id,
        adjudicator:adjudicators(*)
      )
    `)
    .eq("id", matchId)
    .single()

  if (error) throw error
  return data
}
