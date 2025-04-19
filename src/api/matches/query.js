import supabase from "../supabaseClient"

export const getMatchesByRound = async (roundId) => {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      round_id,
      tournament_id,
      team_1_id,
      team_2_id,
      team_3_id,
      team_4_id,
      is_completed,
      is_break_round,
      created_at,
      teams1:teams!team_1_id(id, name, member_1_name, member_2_name),
      teams2:teams!team_2_id(id, name, member_1_name, member_2_name),
      teams3:teams!team_3_id(id, name, member_1_name, member_2_name),
      teams4:teams!team_4_id(id, name, member_1_name, member_2_name),
      match_roles(id, team_id, role),
      match_adjudicators(
        id,
        adjudicator:adjudicators(
          id,
          name,
          email,
          role
        )
      ),
      speaker_points(id, team_id, member_1_points, member_2_points)
    `)
    .eq("round_id", roundId)
    .order("created_at")

  if (error) throw error
  return data
}

export const getMatchById = async (matchId) => {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      round_id,
      tournament_id,
      team_1_id,
      team_2_id,
      team_3_id,
      team_4_id,
      is_completed,
      is_break_round,
      created_at,
      rounds!inner(number, is_break_round, is_closing_round),
      teams1:teams!team_1_id(id, name, member_1_name, member_1_email, member_2_name, member_2_email),
      teams2:teams!team_2_id(id, name, member_1_name, member_1_email, member_2_name, member_2_email),
      teams3:teams!team_3_id(id, name, member_1_name, member_1_email, member_2_name, member_2_email),
      teams4:teams!team_4_id(id, name, member_1_name, member_1_email, member_2_name, member_2_email),
      match_roles(id, team_id, role),
      match_adjudicators(
        id,
        adjudicator:adjudicators(id, name, email, role)
      ),
      speaker_points(id, team_id, member_1_points, member_2_points)
    `)
    .eq("id", matchId)
    .single()

  if (error) throw error
  return data
}
