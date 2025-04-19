import supabase from "../supabaseClient"

export const getTeamsByTournament = async (tournamentId) => {
  const { data, error } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      member_1_name,
      member_1_email,
      member_2_name,
      member_2_email,
      institute,
      tournament_id
    `)
    .eq("tournament_id", tournamentId)
    .order("name")

  if (error) throw error
  return data
}


export const getTeamById = async (teamId) => {
  const { data, error } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      member_1_name,
      member_1_email,
      member_2_name,
      member_2_email,
      institute,
      tournament_id,
      match_roles (
        role,
        match_id,
        match:matches (
          id,
          round_id,
          is_break_round,
          is_completed,
          created_at
        )
      ),
      speaker_points (
        match_id,
        member_1_points,
        member_2_points
      )
    `)
    .eq("id", teamId)
    .single()

  if (error) throw error
  return data
}


export const getTeamByToken = async (token) => {
  const { data, error } = await supabase
    .from("teams")
    .select(`
      *,
      tournament:tournaments (
        id,
        name,
        num_rounds,
        break_rounds,
        is_final_result_uploaded
      ),
      match_roles (
        role,
        match_id,
        match:matches (
          round_id,
          is_break_round,
          is_completed,
          created_at
        )
      ),
      speaker_points (
        match_id,
        member_1_points,
        member_2_points
      )
    `)
    .eq("private_token", token)
    .single()

  if (error) throw error
  return data
}
