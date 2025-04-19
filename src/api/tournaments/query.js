import supabase from "../supabaseClient"

export const getTournamentsByAdmin = async (userId) => {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("created_by_admin_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export const getTournamentById = async (id) => {
  const { data, error } = await supabase
    .from("tournaments")
    .select(`
      id,
      name,
      num_teams,
      num_rounds,
      break_rounds,
      created_at,
      created_by_admin_id,
      is_final_result_uploaded
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export const getTournamentStats = async (tournamentId) => {
  const { data, error } = await supabase
    .from("tournaments")
    .select(`
      id,
      name,
      num_teams,
      num_rounds,
      break_rounds,
      is_final_result_uploaded,
      created_at,
      teams (
        id,
        name,
        member_1_name,
        member_2_name,
        institute,
        match_roles:match_roles (
          role,
          match_id,
          match (
            id,
            round_id,
            is_break_round,
            is_completed,
            created_at
          )
        ),
        speaker_points: speaker_points (
          match_id,
          member_1_points,
          member_2_points
        )
      )
    `)
    .eq("id", tournamentId)
    .single()

  if (error) throw error
  return data
}